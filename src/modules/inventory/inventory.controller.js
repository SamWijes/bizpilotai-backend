'use strict';
const { Product, InventoryTransaction, sequelize } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');
const { INVENTORY_TRANSACTION_TYPE } = require('../../config/constants');

const addStock = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { productId, quantity, reason, notes } = req.body;
        const product = await Product.findOne({ where: { id: productId, businessId: req.businessId }, lock: t.LOCK.UPDATE, transaction: t });
        if (!product) { await t.rollback(); return success(res, { statusCode: 404, message: 'Product not found', data: null }); }

        const balanceBefore = parseFloat(product.quantity);
        const balanceAfter = balanceBefore + parseFloat(quantity);

        await product.update({ quantity: balanceAfter }, { transaction: t });
        const tx = await InventoryTransaction.create({
            businessId: req.businessId, productId, userId: req.user.id,
            type: INVENTORY_TRANSACTION_TYPE.IN, quantity, balanceBefore, balanceAfter,
            reason: reason || 'Stock In', notes,
        }, { transaction: t });

        await t.commit();
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'STOCK_IN', entity: 'Product', entityId: productId });
        return success(res, { statusCode: 201, message: 'Stock added', data: { transaction: tx, currentStock: balanceAfter } });
    } catch (err) { await t.rollback(); next(err); }
};

const removeStock = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { productId, quantity, reason, notes } = req.body;
        const product = await Product.findOne({ where: { id: productId, businessId: req.businessId }, lock: t.LOCK.UPDATE, transaction: t });
        if (!product) { await t.rollback(); return success(res, { statusCode: 404, message: 'Product not found', data: null }); }

        const balanceBefore = parseFloat(product.quantity);
        if (balanceBefore < parseFloat(quantity)) {
            await t.rollback();
            return success(res, { statusCode: 400, message: 'Insufficient stock', data: { available: balanceBefore } });
        }
        const balanceAfter = balanceBefore - parseFloat(quantity);
        await product.update({ quantity: balanceAfter }, { transaction: t });
        const tx = await InventoryTransaction.create({
            businessId: req.businessId, productId, userId: req.user.id,
            type: INVENTORY_TRANSACTION_TYPE.OUT, quantity, balanceBefore, balanceAfter,
            reason: reason || 'Stock Out', notes,
        }, { transaction: t });

        await t.commit();
        return success(res, { statusCode: 201, message: 'Stock removed', data: { transaction: tx, currentStock: balanceAfter } });
    } catch (err) { await t.rollback(); next(err); }
};

const adjustStock = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { productId, newQuantity, reason, notes } = req.body;
        const product = await Product.findOne({ where: { id: productId, businessId: req.businessId }, lock: t.LOCK.UPDATE, transaction: t });
        if (!product) { await t.rollback(); return success(res, { statusCode: 404, message: 'Product not found', data: null }); }

        const balanceBefore = parseFloat(product.quantity);
        const balanceAfter = parseFloat(newQuantity);
        const qty = Math.abs(balanceAfter - balanceBefore);

        await product.update({ quantity: balanceAfter }, { transaction: t });
        const tx = await InventoryTransaction.create({
            businessId: req.businessId, productId, userId: req.user.id,
            type: INVENTORY_TRANSACTION_TYPE.ADJUSTMENT, quantity: qty, balanceBefore, balanceAfter,
            reason: reason || 'Manual Adjustment', notes,
        }, { transaction: t });

        await t.commit();
        return success(res, { statusCode: 201, message: 'Stock adjusted', data: { transaction: tx, currentStock: balanceAfter } });
    } catch (err) { await t.rollback(); next(err); }
};

const getTransactions = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.productId) where.productId = req.query.productId;
        if (req.query.type) where.type = req.query.type;

        const { count, rows } = await InventoryTransaction.findAndCountAll({
            where,
            include: [{ association: 'product', attributes: ['id', 'name', 'sku', 'unit'] }],
            order: getOrder(req.query.sortBy, req.query.sortDir),
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const getSupplierStats = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const { Supplier } = require('../../models');

        const { count, rows } = await Product.findAndCountAll({
            where: { businessId: req.businessId },
            attributes: [
                'id', 'name', 'sku', 'buyingPrice', 'sellingPrice',
                [
                    sequelize.literal(`(
                        SELECT COALESCE(SUM(quantity), 0)
                        FROM InventoryTransactions AS it
                        WHERE it.productId = Product.id AND it.type = 'IN'
                    )`),
                    'totalIn'
                ],
                [
                    sequelize.literal(`(
                        SELECT COALESCE(SUM(quantity), 0)
                        FROM InventoryTransactions AS it
                        WHERE it.productId = Product.id AND (it.type = 'OUT' OR it.type = 'ADJUSTMENT' AND it.quantity < 0)
                    )`),
                    'totalOut' // simplified outgoing quantity, though usually it is explicitly OUT
                ],
                [
                    sequelize.literal(`(
                        SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
                        FROM InventoryTransactions AS it
                        WHERE it.productId = Product.id
                    )`),
                    'computedQuantity' // balance
                ]
            ],
            include: [
                { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'phone'] }
            ],
            order: [
                [{ model: Supplier, as: 'supplier' }, 'name', 'ASC'],
                ['name', 'ASC']
            ],
            limit, offset,
        });

        // Add additional computed values here (like totalValue)
        const formattedRows = rows.map(r => {
            const data = r.toJSON();
            const totalIn = parseFloat(data.totalIn) || 0;
            const balance = parseFloat(data.computedQuantity) || 0;
            const totalOut = totalIn - balance; // Simple deduction for generic OUT/Adjustments

            data.totalIn = totalIn;
            data.totalOut = totalOut;
            data.balance = balance;
            data.totalValue = parseFloat((balance * (parseFloat(data.buyingPrice) || 0)).toFixed(2));

            delete data.computedQuantity;
            return data;
        });

        return success(res, { data: formattedRows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

module.exports = { addStock, removeStock, adjustStock, getTransactions, getSupplierStats };

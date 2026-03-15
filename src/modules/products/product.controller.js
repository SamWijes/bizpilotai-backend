'use strict';
const { Op } = require('sequelize');
const { Product, Category, Supplier } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.categoryId) where.categoryId = req.query.categoryId;
        if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
        if (req.query.lowStock === 'true') {
            // Will update this query later if needed
            where.quantity = { [Op.lte]: Op.col('reorderLevel') };
        }

        const { sequelize } = require('../../models');

        const { count, rows } = await Product.findAndCountAll({
            where,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
                            FROM InventoryTransactions AS it
                            WHERE it.productId = Product.id
                        )`),
                        'computedQuantity'
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
            ],
            order: getOrder(req.query.sortBy, req.query.sortDir, 'name'),
            limit, offset,
        });

        // Map the computed quantity to the output
        const formattedRows = rows.map(r => {
            const data = r.toJSON();
            data.quantity = parseFloat(data.computedQuantity) || 0;
            delete data.computedQuantity;
            return data;
        });

        return success(res, { data: formattedRows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        if (!req.body.supplierId) {
            return success(res, { statusCode: 400, message: 'supplierId is required to create a product', data: null });
        }
        const { quantity, ...productData } = req.body;
        const product = await Product.create({ ...productData, quantity: quantity || 0, businessId: req.businessId });

        if (quantity && parseFloat(quantity) > 0) {
            const { InventoryTransaction } = require('../../models');
            const { INVENTORY_TRANSACTION_TYPE } = require('../../config/constants');
            await InventoryTransaction.create({
                businessId: req.businessId,
                productId: product.id,
                userId: req.user.id,
                type: INVENTORY_TRANSACTION_TYPE.IN,
                quantity: parseFloat(quantity),
                balanceBefore: 0,
                balanceAfter: parseFloat(quantity),
                reason: 'Initial Stock'
            });
        }

        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'PRODUCT_CREATED', entity: 'Product', entityId: product.id });
        return success(res, { statusCode: 201, message: 'Product created', data: product });
    } catch (err) { next(err); }
};

const createBulk = async (req, res, next) => {
    const { sequelize, InventoryTransaction } = require('../../models');
    const { INVENTORY_TRANSACTION_TYPE } = require('../../config/constants');
    const t = await sequelize.transaction();
    try {
        const { supplierId, products } = req.body;
        if (!supplierId || !products || !Array.isArray(products) || products.length === 0) {
            await t.rollback();
            return success(res, { statusCode: 400, message: 'supplierId and products array are required', data: null });
        }

        const createdProducts = [];
        for (const pd of products) {
            const { quantity, ...productData } = pd;
            const product = await Product.create({
                ...productData,
                supplierId,
                quantity: quantity || 0,
                businessId: req.businessId
            }, { transaction: t });

            if (quantity && parseFloat(quantity) > 0) {
                await InventoryTransaction.create({
                    businessId: req.businessId,
                    productId: product.id,
                    userId: req.user.id,
                    type: INVENTORY_TRANSACTION_TYPE.IN,
                    quantity: parseFloat(quantity),
                    balanceBefore: 0,
                    balanceAfter: parseFloat(quantity),
                    reason: 'Initial Bulk Stock'
                }, { transaction: t });
            }
            createdProducts.push(product);
        }

        await t.commit();
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'PRODUCTS_BULK_CREATED', entity: 'Product', entityId: supplierId });
        return success(res, { statusCode: 201, message: `${createdProducts.length} products created successfully`, data: createdProducts });
    } catch (err) {
        await t.rollback();
        next(err);
    }
};

const getOne = async (req, res, next) => {
    try {
        const { sequelize } = require('../../models');
        const product = await Product.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
                            FROM InventoryTransactions AS it
                            WHERE it.productId = Product.id
                        )`),
                        'computedQuantity'
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: Supplier, as: 'supplier' },
            ],
        });
        if (!product) return success(res, { statusCode: 404, message: 'Product not found', data: null });

        const data = product.toJSON();
        data.quantity = parseFloat(data.computedQuantity) || 0;
        delete data.computedQuantity;

        return success(res, { data: data });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const product = await Product.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!product) return success(res, { statusCode: 404, message: 'Product not found', data: null });
        if (req.body.supplierId === null || req.body.supplierId === '') {
            return success(res, { statusCode: 400, message: 'supplierId cannot be empty', data: null });
        }

        const { sequelize, InventoryTransaction } = require('../../models');
        const { INVENTORY_TRANSACTION_TYPE } = require('../../config/constants');

        // Compute CURRENT dynamic quantity
        const currentQtyQuery = await InventoryTransaction.findAll({
            where: { productId: product.id },
            attributes: [
                [sequelize.literal(`COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)`), 'computedQuantity']
            ],
            raw: true
        });
        const currentQty = currentQtyQuery.length ? parseFloat(currentQtyQuery[0].computedQuantity) : 0;

        const { quantity, ...productData } = req.body;
        await product.update({ ...productData, quantity: quantity !== undefined ? quantity : product.quantity });

        if (quantity !== undefined) {
            const newQty = parseFloat(quantity);
            if (newQty !== currentQty) {
                const diff = Math.abs(newQty - currentQty);
                const type = newQty > currentQty ? INVENTORY_TRANSACTION_TYPE.IN : INVENTORY_TRANSACTION_TYPE.OUT;

                await InventoryTransaction.create({
                    businessId: req.businessId,
                    productId: product.id,
                    userId: req.user.id,
                    type: type,
                    quantity: diff,
                    balanceBefore: currentQty,
                    balanceAfter: newQty,
                    reason: 'Product Stock Update'
                });
            }
        }

        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'PRODUCT_UPDATED', entity: 'Product', entityId: product.id });
        return success(res, { message: 'Product updated', data: product });
    } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
    try {
        const product = await Product.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!product) return success(res, { statusCode: 404, message: 'Product not found', data: null });
        await product.update({ isActive: false });
        return success(res, { message: 'Product deactivated', data: null });
    } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
    try {
        const { sequelize } = require('../../models');
        const products = await Product.findAll({
            where: {
                businessId: req.businessId,
                isActive: true,
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
                            FROM InventoryTransactions AS it
                            WHERE it.productId = Product.id
                        )`),
                        'computedQuantity'
                    ]
                ]
            },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
            having: sequelize.literal('computedQuantity <= reorderLevel'),
        });

        const formattedRows = products.map(r => {
            const data = r.toJSON();
            data.quantity = parseFloat(data.computedQuantity) || 0;
            delete data.computedQuantity;
            return data;
        });

        return success(res, { data: formattedRows, meta: { total: formattedRows.length } });
    } catch (err) { next(err); }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({ where: { businessId: req.businessId }, order: [['name', 'ASC']] });
        return success(res, { data: categories });
    } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
    try {
        const cat = await Category.create({ ...req.body, businessId: req.businessId });
        return success(res, { statusCode: 201, data: cat });
    } catch (err) { next(err); }
};

module.exports = { list, create, createBulk, getOne, update, remove, getLowStock, getCategories, createCategory };

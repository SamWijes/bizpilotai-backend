'use strict';
const { Sale, SaleItem, Product, Customer, Invoice, sequelize } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');
const { generateSaleNumber, generateInvoiceNumber } = require('../../utils/numberGenerator');
const { INVENTORY_TRANSACTION_TYPE, SALE_STATUS } = require('../../config/constants');
const InventoryTransaction = require('../../models/InventoryTransaction');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.status) where.status = req.query.status;
        if (req.query.customerId) where.customerId = req.query.customerId;
        if (req.query.startDate && req.query.endDate) {
            const { Op } = require('sequelize');
            where.saleDate = { [Op.between]: [req.query.startDate, req.query.endDate] };
        }
        const { count, rows } = await Sale.findAndCountAll({
            where,
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
                { association: 'createdBy', attributes: ['id', 'name'] },
            ],
            order: getOrder(req.query.sortBy, req.query.sortDir, 'saleDate'),
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { items, customerId, paymentMethod, discountAmount, taxRate, notes, saleDate } = req.body;

        // Validate products and compute totals
        let subtotal = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findOne({
                where: { id: item.productId, businessId: req.businessId, isActive: true },
                lock: t.LOCK.UPDATE,
                transaction: t,
            });
            if (!product) { await t.rollback(); return success(res, { statusCode: 404, message: `Product ${item.productId} not found`, data: null }); }
            if (parseFloat(product.quantity) < item.quantity) {
                await t.rollback();
                return success(res, { statusCode: 400, message: `Insufficient stock for ${product.name}`, data: { available: product.quantity } });
            }
            const itemTotal = (item.quantity * parseFloat(product.sellingPrice)) - (item.discount || 0);
            subtotal += itemTotal;
            enrichedItems.push({ product, item, itemTotal });
        }

        const discount = parseFloat(discountAmount || 0);
        const tax = (subtotal - discount) * ((parseFloat(taxRate || 0)) / 100);
        const total = subtotal - discount + tax;

        const saleNumber = await generateSaleNumber(req.businessId, t);
        const sale = await Sale.create({
            businessId: req.businessId,
            userId: req.user.id,
            customerId: customerId || null,
            saleNumber,
            subtotal,
            discountAmount: discount,
            taxRate: taxRate || 0,
            taxAmount: tax,
            total,
            paymentMethod: paymentMethod || 'CASH',
            status: SALE_STATUS.COMPLETED,
            notes,
            saleDate: saleDate || new Date(),
        }, { transaction: t });

        // Create sale items + deduct inventory
        for (const { product, item, itemTotal } of enrichedItems) {
            await SaleItem.create({
                saleId: sale.id,
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.sellingPrice,
                discount: item.discount || 0,
                total: itemTotal,
            }, { transaction: t });

            const balanceBefore = parseFloat(product.quantity);
            const balanceAfter = balanceBefore - item.quantity;
            await product.update({ quantity: balanceAfter }, { transaction: t });

            // Using direct model since require at top would be circular — import inline
            const { InventoryTransaction } = require('../../models');
            await InventoryTransaction.create({
                businessId: req.businessId, productId: product.id, userId: req.user.id,
                type: INVENTORY_TRANSACTION_TYPE.OUT, quantity: item.quantity,
                balanceBefore, balanceAfter, reason: 'Sale', referenceId: sale.id,
            }, { transaction: t });
        }

        // Update customer total purchases
        if (customerId) {
            await Customer.increment('totalPurchases', { by: total, where: { id: customerId }, transaction: t });
        }

        // Auto-generate invoice
        const invoiceNumber = await generateInvoiceNumber(req.businessId, t);
        const invoice = await Invoice.create({
            businessId: req.businessId,
            saleId: sale.id,
            invoiceNumber,
            status: 'DRAFT',
        }, { transaction: t });

        await t.commit();
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'SALE_CREATED', entity: 'Sale', entityId: sale.id });

        return success(res, {
            statusCode: 201,
            message: 'Sale created',
            data: { sale, invoice: { id: invoice.id, invoiceNumber: invoice.invoiceNumber } },
        });
    } catch (err) { await t.rollback(); next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const sale = await Sale.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            include: [
                { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'sku', 'unit'] }] },
                { model: Customer, as: 'customer' },
                { association: 'invoice' },
                { association: 'createdBy', attributes: ['id', 'name'] },
            ],
        });
        if (!sale) return success(res, { statusCode: 404, message: 'Sale not found', data: null });
        return success(res, { data: sale });
    } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
    try {
        const sale = await Sale.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!sale) return success(res, { statusCode: 404, message: 'Sale not found', data: null });
        if (sale.status === SALE_STATUS.CANCELLED) return success(res, { statusCode: 400, message: 'Sale already cancelled', data: null });
        await sale.update({ status: SALE_STATUS.CANCELLED });
        return success(res, { message: 'Sale cancelled', data: sale });
    } catch (err) { next(err); }
};

module.exports = { list, create, getOne, cancel };

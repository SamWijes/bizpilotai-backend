'use strict';
const { Invoice, Sale, SaleItem, Customer, Business } = require('../../models');
const { success } = require('../../utils/response');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const { logActivity } = require('../../utils/activityLogger');

const list = async (req, res, next) => {
    try {
        const { Op } = require('sequelize');
        const where = { businessId: req.businessId };
        if (req.query.status) where.status = req.query.status;

        const invoices = await Invoice.findAll({
            where,
            include: [{ model: Sale, as: 'sale', attributes: ['id', 'saleNumber', 'total', 'saleDate', 'paymentMethod'] }],
            order: [['createdAt', 'DESC']],
        });
        return success(res, { data: invoices });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            include: [
                {
                    model: Sale, as: 'sale',
                    include: [
                        { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'sku', 'unit'] }] },
                        { model: Customer, as: 'customer' },
                    ],
                },
            ],
        });
        if (!invoice) return success(res, { statusCode: 404, message: 'Invoice not found', data: null });
        return success(res, { data: invoice });
    } catch (err) { next(err); }
};

const downloadPDF = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            include: [{
                model: Sale, as: 'sale',
                include: [
                    { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'sku', 'unit'] }] },
                    { model: Customer, as: 'customer' },
                ],
            }],
        });
        if (!invoice) return success(res, { statusCode: 404, message: 'Invoice not found', data: null });

        const business = await Business.findByPk(req.businessId);

        generateInvoicePDF(res, {
            business,
            customer: invoice.sale.customer,
            invoice,
            sale: invoice.sale,
            items: invoice.sale.items,
        });

        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'INVOICE_DOWNLOADED', entity: 'Invoice', entityId: invoice.id });
    } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!invoice) return success(res, { statusCode: 404, message: 'Invoice not found', data: null });
        await invoice.update({ status: req.body.status, notes: req.body.notes || invoice.notes });
        return success(res, { message: 'Invoice status updated', data: invoice });
    } catch (err) { next(err); }
};

module.exports = { list, getOne, downloadPDF, updateStatus };

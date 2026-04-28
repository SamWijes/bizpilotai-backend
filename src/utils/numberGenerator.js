'use strict';
const { Sale, Invoice, sequelize } = require('../models');

/**
 * Generate a zero-padded sequential number unique to a business.
 * Format: PREFIX-YYYY-NNNNNN (e.g. SL-2024-000001)
 */
const generateNumber = async (model, field, prefix, businessId, transaction) => {
    const year = new Date().getFullYear();
    const likePattern = `${prefix}-${year}-%`;

    const last = await model.findOne({
        where: { businessId, [field]: sequelize.where(sequelize.col(field), 'LIKE', likePattern) },
        order: [[field, 'DESC']],
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
        transaction,
    });

    let seq = 1;
    if (last) {
        const parts = last[field].split('-');
        seq = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}-${year}-${String(seq).padStart(6, '0')}`;
};

const generateSaleNumber = (businessId, t) =>
    generateNumber(Sale, 'saleNumber', 'SL', businessId, t);

const generateInvoiceNumber = (businessId, t) =>
    generateNumber(Invoice, 'invoiceNumber', 'INV', businessId, t);

module.exports = { generateSaleNumber, generateInvoiceNumber };

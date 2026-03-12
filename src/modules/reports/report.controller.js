'use strict';
const { Op, fn, col, literal } = require('sequelize');
const { Sale, SaleItem, Product, Expense, Income, Customer, sequelize } = require('../../models');
const { success } = require('../../utils/response');

/** Dashboard metrics — total sales, profit, low stock count, recent transactions */
const getDashboard = async (req, res, next) => {
    try {
        const bId = req.businessId;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalSalesThisMonth, totalExpensesThisMonth, recentSales, lowStockCount, topProducts] =
            await Promise.all([
                // Monthly sales total
                Sale.sum('total', { where: { businessId: bId, saleDate: { [Op.gte]: monthStart }, status: 'COMPLETED' } }),
                // Monthly expenses total
                Expense.sum('amount', { where: { businessId: bId, date: { [Op.gte]: monthStart } } }),
                // Recent 5 sales
                Sale.findAll({
                    where: { businessId: bId }, order: [['saleDate', 'DESC']], limit: 5,
                    include: [{ association: 'customer', attributes: ['id', 'name'] }],
                    attributes: ['id', 'saleNumber', 'total', 'saleDate', 'status', 'paymentMethod'],
                }),
                // Low stock count
                Product.count({
                    where: {
                        businessId: bId,
                        isActive: true,
                        quantity: { [Op.lte]: literal('`reorderLevel`') },
                    },
                }),
                // Top 5 selling products this month
                SaleItem.findAll({
                    attributes: ['productId', [fn('SUM', col('quantity')), 'totalSold'], [fn('SUM', col('SaleItem.total')), 'revenue']],
                    include: [
                        { model: Sale, as: 'sale', where: { businessId: bId, saleDate: { [Op.gte]: monthStart }, status: 'COMPLETED' }, attributes: [] },
                        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
                    ],
                    group: ['productId'],
                    order: [[fn('SUM', col('quantity')), 'DESC']],
                    limit: 5,
                    subQuery: false,
                }),
            ]);

        const monthlySales = totalSalesThisMonth || 0;
        const monthlyExpenses = totalExpensesThisMonth || 0;
        const monthlyProfit = monthlySales - monthlyExpenses;

        return success(res, {
            data: {
                monthlySales,
                monthlyExpenses,
                monthlyProfit,
                lowStockCount,
                recentSales,
                topProducts,
            },
        });
    } catch (err) { next(err); }
};

/** Sales by date range */
const getSalesByRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { businessId: req.businessId, status: 'COMPLETED' };
        if (startDate && endDate) where.saleDate = { [Op.between]: [startDate, endDate] };

        const sales = await Sale.findAll({
            where,
            attributes: [
                'saleDate',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('total')), 'total'],
                [fn('SUM', col('taxAmount')), 'totalTax'],
                [fn('SUM', col('discountAmount')), 'totalDiscount'],
            ],
            group: ['saleDate'],
            order: [['saleDate', 'ASC']],
        });
        return success(res, { data: sales });
    } catch (err) { next(err); }
};

/** Profit summary by month */
const getProfitSummary = async (req, res, next) => {
    try {
        const bId = req.businessId;
        const { year } = req.query;
        const y = parseInt(year, 10) || new Date().getFullYear();

        const [salesByMonth, expensesByMonth] = await Promise.all([
            Sale.findAll({
                where: { businessId: bId, status: 'COMPLETED', saleDate: { [Op.between]: [`${y}-01-01`, `${y}-12-31`] } },
                attributes: [[fn('MONTH', col('saleDate')), 'month'], [fn('SUM', col('total')), 'totalSales'], [fn('SUM', col('taxAmount')), 'totalTax']],
                group: [fn('MONTH', col('saleDate'))],
            }),
            Expense.findAll({
                where: { businessId: bId, date: { [Op.between]: [`${y}-01-01`, `${y}-12-31`] } },
                attributes: [[fn('MONTH', col('date')), 'month'], [fn('SUM', col('amount')), 'totalExpenses']],
                group: [fn('MONTH', col('date'))],
            }),
        ]);

        return success(res, { data: { year: y, salesByMonth, expensesByMonth } });
    } catch (err) { next(err); }
};

/** Top selling products */
const getTopProducts = async (req, res, next) => {
    try {
        const { startDate, endDate, limit: lim } = req.query;
        const saleWhere = { businessId: req.businessId, status: 'COMPLETED' };
        if (startDate && endDate) saleWhere.saleDate = { [Op.between]: [startDate, endDate] };

        const result = await SaleItem.findAll({
            attributes: ['productId', [fn('SUM', col('quantity')), 'totalSold'], [fn('SUM', col('SaleItem.total')), 'revenue']],
            include: [
                { model: Sale, as: 'sale', where: saleWhere, attributes: [] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit', 'sellingPrice'] },
            ],
            group: ['productId'],
            order: [[fn('SUM', col('quantity')), 'DESC']],
            limit: parseInt(lim, 10) || 10,
            subQuery: false,
        });
        return success(res, { data: result });
    } catch (err) { next(err); }
};

module.exports = { getDashboard, getSalesByRange, getProfitSummary, getTopProducts };

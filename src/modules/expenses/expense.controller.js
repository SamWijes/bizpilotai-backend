'use strict';
const { Op } = require('sequelize');
const { Expense, Income } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');

// ── Expenses ──────────────────────────────────────────────────────────────
const listExpenses = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.startDate && req.query.endDate) {
            where.date = { [Op.between]: [req.query.startDate, req.query.endDate] };
        }
        if (req.query.categoryId) where.categoryId = req.query.categoryId;
        const { count, rows } = await Expense.findAndCountAll({
            where,
            include: [{ association: 'category', attributes: ['id', 'name'] }],
            order: getOrder(req.query.sortBy, req.query.sortDir, 'date'),
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create({ ...req.body, businessId: req.businessId, userId: req.user.id });
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'EXPENSE_CREATED', entity: 'Expense', entityId: expense.id });
        return success(res, { statusCode: 201, message: 'Expense recorded', data: expense });
    } catch (err) { next(err); }
};

const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!expense) return success(res, { statusCode: 404, message: 'Expense not found', data: null });
        await expense.update(req.body);
        return success(res, { message: 'Expense updated', data: expense });
    } catch (err) { next(err); }
};

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!expense) return success(res, { statusCode: 404, message: 'Expense not found', data: null });
        await expense.destroy();
        return success(res, { message: 'Expense deleted', data: null });
    } catch (err) { next(err); }
};

// ── Income ────────────────────────────────────────────────────────────────
const listIncome = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.startDate && req.query.endDate) {
            where.date = { [Op.between]: [req.query.startDate, req.query.endDate] };
        }
        const { count, rows } = await Income.findAll({ where, order: getOrder(req.query.sortBy, req.query.sortDir, 'date'), limit, offset });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const createIncome = async (req, res, next) => {
    try {
        const income = await Income.create({ ...req.body, businessId: req.businessId, userId: req.user.id });
        return success(res, { statusCode: 201, message: 'Income recorded', data: income });
    } catch (err) { next(err); }
};

const updateIncome = async (req, res, next) => {
    try {
        const income = await Income.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!income) return success(res, { statusCode: 404, message: 'Income not found', data: null });
        await income.update(req.body);
        return success(res, { message: 'Income updated', data: income });
    } catch (err) { next(err); }
};

const deleteIncome = async (req, res, next) => {
    try {
        const income = await Income.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!income) return success(res, { statusCode: 404, message: 'Income not found', data: null });
        await income.destroy();
        return success(res, { message: 'Income deleted', data: null });
    } catch (err) { next(err); }
};

module.exports = { listExpenses, createExpense, updateExpense, deleteExpense, listIncome, createIncome, updateIncome, deleteIncome };

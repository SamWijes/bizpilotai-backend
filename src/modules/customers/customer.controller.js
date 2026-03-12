'use strict';
const { Op } = require('sequelize');
const { Customer } = require('../../models');
const { success } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { paginate } = require('../../utils/response');
const { logActivity } = require('../../utils/activityLogger');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const { search, isActive } = req.query;

        const where = { businessId: req.businessId };
        if (search) where.name = { [Op.like]: `%${search}%` };
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const { count, rows } = await Customer.findAndCountAll({
            where,
            order: getOrder(req.query.sortBy, req.query.sortDir),
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const customer = await Customer.create({ ...req.body, businessId: req.businessId });
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'CUSTOMER_CREATED', entity: 'Customer', entityId: customer.id });
        return success(res, { statusCode: 201, message: 'Customer created', data: customer });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!customer) return success(res, { statusCode: 404, message: 'Customer not found', data: null });
        return success(res, { data: customer });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!customer) return success(res, { statusCode: 404, message: 'Customer not found', data: null });
        await customer.update(req.body);
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'CUSTOMER_UPDATED', entity: 'Customer', entityId: customer.id });
        return success(res, { message: 'Customer updated', data: customer });
    } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!customer) return success(res, { statusCode: 404, message: 'Customer not found', data: null });
        await customer.update({ isActive: false });
        return success(res, { message: 'Customer deactivated', data: null });
    } catch (err) { next(err); }
};

module.exports = { list, create, getOne, update, remove };

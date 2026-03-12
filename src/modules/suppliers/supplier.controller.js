'use strict';
const { Op } = require('sequelize');
const { Supplier } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };
        if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
        if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
        const { count, rows } = await Supplier.findAndCountAll({ where, order: getOrder(req.query.sortBy, req.query.sortDir), limit, offset });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const supplier = await Supplier.create({ ...req.body, businessId: req.businessId });
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'SUPPLIER_CREATED', entity: 'Supplier', entityId: supplier.id });
        return success(res, { statusCode: 201, message: 'Supplier created', data: supplier });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!supplier) return success(res, { statusCode: 404, message: 'Supplier not found', data: null });
        return success(res, { data: supplier });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!supplier) return success(res, { statusCode: 404, message: 'Supplier not found', data: null });
        await supplier.update(req.body);
        return success(res, { message: 'Supplier updated', data: supplier });
    } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!supplier) return success(res, { statusCode: 404, message: 'Supplier not found', data: null });
        await supplier.update({ isActive: false });
        return success(res, { message: 'Supplier deactivated', data: null });
    } catch (err) { next(err); }
};

module.exports = { list, create, getOne, update, remove };

'use strict';
const { Op } = require('sequelize');
const { Item, Category } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination, getOrder } = require('../../utils/pagination');
const { logActivity } = require('../../utils/activityLogger');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = { businessId: req.businessId };

        if (req.query.search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${req.query.search}%` } },
                { sku: { [Op.like]: `%${req.query.search}%` } },
            ];
        }
        if (req.query.categoryId) where.categoryId = req.query.categoryId;

        const { count, rows } = await Item.findAndCountAll({
            where,
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
            order: getOrder(req.query.sortBy, req.query.sortDir, 'name'),
            limit, offset,
        });

        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const item = await Item.create({ ...req.body, businessId: req.businessId });
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'ITEM_CREATED', entity: 'Item', entityId: item.id });
        return success(res, { statusCode: 201, message: 'Item created', data: item });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const item = await Item.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            include: [{ model: Category, as: 'category' }],
        });
        if (!item) return success(res, { statusCode: 404, message: 'Item not found', data: null });
        return success(res, { data: item });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!item) return success(res, { statusCode: 404, message: 'Item not found', data: null });

        await item.update(req.body);
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'ITEM_UPDATED', entity: 'Item', entityId: item.id });
        return success(res, { message: 'Item updated', data: item });
    } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
    try {
        const item = await Item.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!item) return success(res, { statusCode: 404, message: 'Item not found', data: null });

        await item.destroy();
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'ITEM_DELETED', entity: 'Item', entityId: item.id });
        return success(res, { message: 'Item deleted', data: null });
    } catch (err) { next(err); }
};

module.exports = { list, create, getOne, update, remove };

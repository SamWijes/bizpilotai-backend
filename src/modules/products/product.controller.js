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
            where.quantity = { [Op.lte]: Op.col('reorderLevel') };
        }
        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
            ],
            order: getOrder(req.query.sortBy, req.query.sortDir, 'name'),
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const product = await Product.create({ ...req.body, businessId: req.businessId });
        logActivity({ userId: req.user.id, businessId: req.businessId, action: 'PRODUCT_CREATED', entity: 'Product', entityId: product.id });
        return success(res, { statusCode: 201, message: 'Product created', data: product });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            where: { id: req.params.id, businessId: req.businessId },
            include: [
                { model: Category, as: 'category' },
                { model: Supplier, as: 'supplier' },
            ],
        });
        if (!product) return success(res, { statusCode: 404, message: 'Product not found', data: null });
        return success(res, { data: product });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const product = await Product.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!product) return success(res, { statusCode: 404, message: 'Product not found', data: null });
        await product.update(req.body);
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
                quantity: { [Op.lte]: sequelize.col('reorderLevel') },
            },
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        });
        return success(res, { data: products, meta: { total: products.length } });
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

module.exports = { list, create, getOne, update, remove, getLowStock, getCategories, createCategory };

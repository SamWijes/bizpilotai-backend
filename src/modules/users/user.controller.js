'use strict';
const bcrypt = require('bcryptjs');
const { User, Business } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');
const { ROLES } = require('../../config/constants');

const list = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const { count, rows } = await User.findAndCountAll({
            where: { businessId: req.businessId },
            order: [['name', 'ASC']],
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.scope('withPassword').findOne({ where: { email } });
        if (exists) return success(res, { statusCode: 409, message: 'Email already in use', data: null });

        const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS, 10) || 12);
        const user = await User.create({
            businessId: req.businessId,
            name, email, passwordHash,
            role: role || ROLES.STAFF,
        });
        return success(res, { statusCode: 201, message: 'Staff user created', data: user });
    } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!user) return success(res, { statusCode: 404, message: 'User not found', data: null });
        return success(res, { data: user });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!user) return success(res, { statusCode: 404, message: 'User not found', data: null });
        const { name, role, isActive, phoneNumber } = req.body;
        await user.update({ name, role, isActive, phoneNumber });
        return success(res, { message: 'User updated', data: user });
    } catch (err) { next(err); }
};

const deactivate = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id, businessId: req.businessId } });
        if (!user) return success(res, { statusCode: 404, message: 'User not found', data: null });
        await user.update({ isActive: false });
        return success(res, { message: 'User deactivated', data: null });
    } catch (err) { next(err); }
};

module.exports = { list, create, getOne, update, deactivate };

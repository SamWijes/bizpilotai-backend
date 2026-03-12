'use strict';
const { Business, User, AiUsageLog, SubscriptionPlan, sequelize, fn, col, Op } = require('../../models');
const { success, paginate } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');
const { BUSINESS_STATUS } = require('../../config/constants');

const listBusinesses = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const { count, rows } = await Business.findAndCountAll({
            where,
            include: [{ association: 'subscriptionPlan', attributes: ['id', 'name', 'price'] }],
            order: [['createdAt', 'DESC']],
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const getBusinessDetail = async (req, res, next) => {
    try {
        const biz = await Business.findByPk(req.params.id, {
            include: [
                { association: 'subscriptionPlan' },
                { association: 'users', attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt'] },
            ],
        });
        if (!biz) return success(res, { statusCode: 404, message: 'Business not found', data: null });
        return success(res, { data: biz });
    } catch (err) { next(err); }
};

const activateBusiness = async (req, res, next) => {
    try {
        const biz = await Business.findByPk(req.params.id);
        if (!biz) return success(res, { statusCode: 404, message: 'Business not found', data: null });
        await biz.update({ status: BUSINESS_STATUS.ACTIVE });
        return success(res, { message: 'Business activated', data: { id: biz.id, status: biz.status } });
    } catch (err) { next(err); }
};

const suspendBusiness = async (req, res, next) => {
    try {
        const biz = await Business.findByPk(req.params.id);
        if (!biz) return success(res, { statusCode: 404, message: 'Business not found', data: null });
        await biz.update({ status: BUSINESS_STATUS.SUSPENDED });
        return success(res, { message: 'Business suspended', data: { id: biz.id, status: biz.status } });
    } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
    try {
        const [bizCount, userCount, aiLogCount] = await Promise.all([
            Business.count(),
            User.count({ where: { role: ['OWNER', 'STAFF'] } }),
            AiUsageLog.count(),
        ]);

        const byStat = await Business.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['status'],
        });

        return success(res, { data: { totalBusinesses: bizCount, totalUsers: userCount, totalAiRequests: aiLogCount, businessesByStatus: byStat } });
    } catch (err) { next(err); }
};

const getAiLogs = async (req, res, next) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const where = {};
        if (req.query.businessId) where.businessId = req.query.businessId;
        if (req.query.promptType) where.promptType = req.query.promptType;
        const { count, rows } = await AiUsageLog.findAndCountAll({
            where,
            include: [
                { association: 'business', attributes: ['id', 'name'] },
                { association: 'user', attributes: ['id', 'name', 'email'] },
            ],
            order: [['createdAt', 'DESC']],
            limit, offset,
        });
        return success(res, { data: rows, meta: paginate({ page, limit, total: count }) });
    } catch (err) { next(err); }
};

const getPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
        return success(res, { data: plans });
    } catch (err) { next(err); }
};

const updatePlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findByPk(req.params.id);
        if (!plan) return success(res, { statusCode: 404, message: 'Plan not found', data: null });
        await plan.update(req.body);
        return success(res, { message: 'Plan updated', data: plan });
    } catch (err) { next(err); }
};

module.exports = { listBusinesses, getBusinessDetail, activateBusiness, suspendBusiness, getStats, getAiLogs, getPlans, updatePlan };

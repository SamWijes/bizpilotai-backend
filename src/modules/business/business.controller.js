'use strict';
const { Business, User } = require('../../models');
const { success } = require('../../utils/response');

const getProfile = async (req, res, next) => {
    try {
        const business = await Business.findByPk(req.businessId, {
            include: [{ association: 'subscriptionPlan' }],
        });
        return success(res, { data: business });
    } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, currency, timezone, website, taxRate } = req.body;
        const business = await Business.findByPk(req.businessId);
        if (!business) return success(res, { statusCode: 404, message: 'Business not found', data: null });
        await business.update({ name, phone, address, currency, timezone, website, taxRate });
        return success(res, { message: 'Business profile updated', data: business });
    } catch (err) { next(err); }
};

const getSettings = async (req, res, next) => {
    try {
        const business = await Business.findByPk(req.businessId, { attributes: ['id', 'settings', 'taxRate', 'currency', 'timezone'] });
        return success(res, { data: business });
    } catch (err) { next(err); }
};

const updateSettings = async (req, res, next) => {
    try {
        const business = await Business.findByPk(req.businessId);
        await business.update({ settings: { ...business.settings, ...req.body } });
        return success(res, { message: 'Settings updated', data: business.settings });
    } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getSettings, updateSettings };

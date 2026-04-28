'use strict';
const authService = require('./auth.service');
const { success } = require('../../utils/response');
const { logActivity } = require('../../utils/activityLogger');

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        logActivity({
            userId: result.user.id,
            businessId: result.business.id,
            action: 'USER_REGISTERED',
            entity: 'User',
            entityId: result.user.id,
            ipAddress: req.ip,
        });
        return success(res, {
            statusCode: 201,
            message: 'Business registered successfully',
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
                business: { id: result.business.id, name: result.business.name },
            },
        });
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        logActivity({
            userId: result.user.id,
            businessId: result.business?.id,
            action: 'USER_LOGIN',
            ipAddress: req.ip,
        });
        return success(res, {
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
                business: result.business ? { id: result.business.id, name: result.business.name, status: result.business.status } : null,
            },
        });
    } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
    try {
        const tokens = await authService.refreshTokens(req.body);
        return success(res, { message: 'Tokens refreshed', data: tokens });
    } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.id);
        return success(res, { message: 'Logged out successfully', data: null });
    } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
    try {
        return success(res, { data: req.user });
    } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
    try {
        await authService.changePassword(req.user.id, req.body);
        return success(res, { message: 'Password changed successfully', data: null });
    } catch (err) { next(err); }
};

module.exports = { register, login, refresh, logout, getProfile, changePassword };

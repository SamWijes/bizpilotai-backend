'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Business, User, SubscriptionPlan } = require('../../models');
const { ROLES, BUSINESS_STATUS } = require('../../config/constants');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

/** Sign a short-lived access token */
const signAccessToken = (user) =>
    jwt.sign(
        { userId: user.id, role: user.role, businessId: user.businessId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' }
    );

/** Sign a long-lived refresh token */
const signRefreshToken = (user) =>
    jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

/**
 * Register a new business + owner account.
 */
const register = async ({ businessName, businessEmail, businessPhone, name, email, password, currency, timezone }) => {
    // Check if user email already exists
    const existing = await User.scope('withPassword').findOne({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

    // Check if business email already exists
    const existingBiz = await Business.findOne({ where: { email: businessEmail } });
    if (existingBiz) throw Object.assign(new Error('Business email already in use'), { statusCode: 409 });

    // Get the default free plan
    const freePlan = await SubscriptionPlan.findOne({ where: { name: 'Free' } });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create business
    const business = await Business.create({
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        currency: currency || 'USD',
        timezone: timezone || 'UTC',
        status: BUSINESS_STATUS.TRIAL,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        subscriptionPlanId: freePlan?.id || null,
    });

    // Create owner user
    const user = await User.create({
        businessId: business.id,
        name,
        email,
        passwordHash,
        role: ROLES.OWNER,
        isActive: true,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await User.scope('withPassword').update({ refreshToken }, { where: { id: user.id } });

    return { accessToken, refreshToken, business, user };
};

/**
 * Authenticate a user and return JWT tokens.
 */
const login = async ({ email, password }) => {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account is deactivated'), { statusCode: 403 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await User.scope('withPassword').update(
        { refreshToken, lastLoginAt: new Date() },
        { where: { id: user.id } }
    );

    // Load business info
    const business = user.businessId ? await Business.findByPk(user.businessId) : null;

    return { accessToken, refreshToken, user, business };
};

/**
 * Rotate tokens using a valid refresh token.
 */
const refreshTokens = async ({ refreshToken }) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const user = await User.scope('withPassword').findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
        throw Object.assign(new Error('Refresh token mismatch'), { statusCode: 401 });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    await User.scope('withPassword').update({ refreshToken: newRefreshToken }, { where: { id: user.id } });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Invalidate a user's refresh token (logout).
 */
const logout = async (userId) => {
    await User.scope('withPassword').update({ refreshToken: null }, { where: { id: userId } });
};

/**
 * Change user's own password.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.scope('withPassword').findByPk(userId);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 });
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await User.scope('withPassword').update({ passwordHash, refreshToken: null }, { where: { id: userId } });
};

module.exports = { register, login, refreshTokens, logout, changePassword };

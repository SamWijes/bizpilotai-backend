'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error } = require('../utils/response');

/**
 * Authenticate middleware — verifies JWT from Authorization header.
 * Attaches decoded user to req.user and injects req.businessId.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return error(res, { message: 'No token provided', statusCode: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
            return error(res, { message: msg, statusCode: 401 });
        }

        // Fetch user (default scope excludes passwordHash/refreshToken)
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            return error(res, { message: 'User not found or deactivated', statusCode: 401 });
        }

        req.user = user;
        req.businessId = user.businessId; // null for platform admins
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = authenticate;

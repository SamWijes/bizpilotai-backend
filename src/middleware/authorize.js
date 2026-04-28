'use strict';
const { error } = require('../utils/response');
const { ROLES } = require('../config/constants');

/**
 * authorize(...roles) — returns middleware that checks if req.user.role is in the allowed set.
 * Usage: router.get('/admin', authenticate, authorize(ROLES.ADMIN), handler)
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return error(res, { message: 'Unauthorized', statusCode: 401 });
    }
    if (!roles.includes(req.user.role)) {
        return error(res, {
            message: 'You do not have permission to access this resource',
            statusCode: 403,
        });
    }
    next();
};

/** Convenience shorthand: only ADMIN role */
const isAdmin = authorize(ROLES.ADMIN);

/** Convenience shorthand: OWNER and STAFF */
const isBusiness = authorize(ROLES.OWNER, ROLES.STAFF);

/** Convenience shorthand: only OWNER within a business */
const isOwner = authorize(ROLES.OWNER);

/**
 * scopeBusiness — ensures business users can only see their own data.
 * Attaches req.businessId from the authed user (already done in authenticate).
 * Admin users bypass this.
 */
const scopeBusiness = (req, res, next) => {
    if (req.user.role === ROLES.ADMIN) {
        // Admin can query any business; businessId comes from route param or query
        req.businessId = req.params.businessId || req.query.businessId || null;
    } else {
        // Business users are locked to their own businessId
        if (!req.user.businessId) {
            return error(res, { message: 'User is not associated with a business', statusCode: 403 });
        }
        req.businessId = req.user.businessId;
    }
    next();
};

module.exports = { authorize, isAdmin, isBusiness, isOwner, scopeBusiness };

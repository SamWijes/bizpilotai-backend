'use strict';
const { ActivityLog } = require('../models');
const logger = require('./logger');

/**
 * Log an activity asynchronously — fire and forget (non-blocking).
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.businessId
 * @param {string} params.action    - e.g. 'SALE_CREATED'
 * @param {string} params.entity    - e.g. 'Sale'
 * @param {string} params.entityId
 * @param {string} params.description
 * @param {object} params.metadata
 * @param {string} params.ipAddress
 */
const logActivity = (params) => {
    ActivityLog.create({
        userId: params.userId || null,
        businessId: params.businessId || null,
        action: params.action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        description: params.description || null,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress || null,
    }).catch((err) => {
        // Never throw — audit log failure must not crash the request
        logger.error('ActivityLog write failed:', err.message);
    });
};

module.exports = { logActivity };

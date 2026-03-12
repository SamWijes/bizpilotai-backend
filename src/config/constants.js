'use strict';

/**
 * Application-wide constants
 */

const ROLES = Object.freeze({
    OWNER: 'OWNER',
    STAFF: 'STAFF',
    ADMIN: 'ADMIN', // Platform-level admin
});

const BUSINESS_STATUS = Object.freeze({
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    TRIAL: 'TRIAL',
});

const SALE_STATUS = Object.freeze({
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
});

const INVOICE_STATUS = Object.freeze({
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
});

const INVENTORY_TRANSACTION_TYPE = Object.freeze({
    IN: 'IN',
    OUT: 'OUT',
    ADJUSTMENT: 'ADJUSTMENT',
});

const PAYMENT_METHOD = Object.freeze({
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER',
    OTHER: 'OTHER',
});

const AI_PROMPT_TYPE = Object.freeze({
    INSIGHT: 'INSIGHT',
    EMAIL: 'EMAIL',
    INVOICE_SUMMARY: 'INVOICE_SUMMARY',
    SOCIAL_POST: 'SOCIAL_POST',
    CHAT: 'CHAT',
});

const PAGINATION_DEFAULTS = Object.freeze({
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
});

module.exports = {
    ROLES,
    BUSINESS_STATUS,
    SALE_STATUS,
    INVOICE_STATUS,
    INVENTORY_TRANSACTION_TYPE,
    PAYMENT_METHOD,
    AI_PROMPT_TYPE,
    PAGINATION_DEFAULTS,
};

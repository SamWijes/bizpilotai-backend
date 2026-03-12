'use strict';

/**
 * Standardized JSON response helpers.
 * All API responses use these helpers for consistency.
 */

/**
 * Send a success response
 * @param {import('express').Response} res
 * @param {object} options
 * @param {any} options.data
 * @param {string} options.message
 * @param {number} options.statusCode
 * @param {object} options.meta  - pagination metadata
 */
const success = (res, { data = null, message = 'Success', statusCode = 200, meta = null } = {}) => {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(statusCode).json(body);
};

/**
 * Send an error response
 */
const error = (res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) => {
    const body = { success: false, message };
    if (errors !== null) body.errors = errors;
    return res.status(statusCode).json(body);
};

/**
 * Build pagination metadata
 */
const paginate = ({ page, limit, total }) => ({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
});

module.exports = { success, error, paginate };

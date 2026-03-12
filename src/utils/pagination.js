'use strict';
const { PAGINATION_DEFAULTS } = require('../config/constants');

/**
 * Extract and validate pagination parameters from query string.
 * @param {object} query - req.query
 * @returns {{ page, limit, offset }}
 */
const getPagination = (query) => {
    let page = parseInt(query.page, 10) || PAGINATION_DEFAULTS.PAGE;
    let limit = parseInt(query.limit, 10) || PAGINATION_DEFAULTS.LIMIT;

    if (page < 1) page = 1;
    if (limit < 1) limit = PAGINATION_DEFAULTS.LIMIT;
    if (limit > PAGINATION_DEFAULTS.MAX_LIMIT) limit = PAGINATION_DEFAULTS.MAX_LIMIT;

    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

/**
 * Build a Sequelize order array from query string params.
 * @param {string} sortBy  - field name
 * @param {string} sortDir - 'ASC' | 'DESC'
 * @param {string} defaultField
 * @returns {Array}
 */
const getOrder = (sortBy, sortDir = 'DESC', defaultField = 'createdAt') => {
    const allowedDirs = ['ASC', 'DESC'];
    const dir = allowedDirs.includes((sortDir || '').toUpperCase()) ? sortDir.toUpperCase() : 'DESC';
    return [[sortBy || defaultField, dir]];
};

module.exports = { getPagination, getOrder };

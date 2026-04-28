'use strict';
const logger = require('../utils/logger');

/**
 * Centralized error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    // Log the error
    logger.error(`[${req.method}] ${req.path} — ${err.message}`, {
        stack: err.stack,
        body: req.body,
    });

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors?.map((e) => ({ field: e.path, message: e.message }));
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }

    // Sequelize FK constraint
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'A referenced record does not exist',
        });
    }

    // JWT errors (should be caught upstream, but fallback)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Default: 500
    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;

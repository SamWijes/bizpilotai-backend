'use strict';
const rateLimit = require('express-rate-limit');
const { error } = require('../utils/response');

const handler = (_req, res) => {
    error(res, { message: 'Too many requests, please try again later.', statusCode: 429 });
};

/** Global limiter — 100 requests/min per IP */
const globalRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});

/** AI route limiter — 10 requests/min per IP */
const aiRateLimiter = rateLimit({
    windowMs: 60_000,
    max: parseInt(process.env.AI_RATE_LIMIT_MAX, 10) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    message: 'AI request limit reached. Please wait before making more AI requests.',
});

/** Auth route limiter — 20 requests/min per IP (prevent brute force) */
const authRateLimiter = rateLimit({
    windowMs: 60_000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});

module.exports = { globalRateLimiter, aiRateLimiter, authRateLimiter };

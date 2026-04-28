'use strict';
const { Router } = require('express');
const c = require('./ai.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');
const { aiRateLimiter } = require('../../middleware/rateLimiter');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness, aiRateLimiter);

/** @swagger
 * tags:
 *   name: AI
 *   description: AI-powered business tools (OpenAI)
 */
router.post('/insights', c.insights);
router.post('/email', c.emailCompose);
router.post('/invoice-summary', c.invoiceSummary);
router.post('/social-post', c.socialPost);
router.post('/chat', c.chatQuery);

module.exports = router;

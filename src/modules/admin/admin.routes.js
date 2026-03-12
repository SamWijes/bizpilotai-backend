'use strict';
const { Router } = require('express');
const c = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const { isAdmin } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, isAdmin);

/** @swagger
 * tags:
 *   name: Admin
 *   description: Platform admin endpoints (admin role only)
 */
router.get('/businesses', c.listBusinesses);
router.get('/businesses/:id', c.getBusinessDetail);
router.patch('/businesses/:id/activate', c.activateBusiness);
router.patch('/businesses/:id/suspend', c.suspendBusiness);
router.get('/stats', c.getStats);
router.get('/ai-logs', c.getAiLogs);
router.get('/plans', c.getPlans);
router.put('/plans/:id', c.updatePlan);

module.exports = router;

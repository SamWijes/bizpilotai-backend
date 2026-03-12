'use strict';
const { Router } = require('express');
const c = require('./report.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

/** @swagger
 * tags:
 *   name: Reports
 *   description: Business analytics and reports
 */
router.get('/dashboard', c.getDashboard);
router.get('/sales', c.getSalesByRange);
router.get('/profit', c.getProfitSummary);
router.get('/top-products', c.getTopProducts);

module.exports = router;

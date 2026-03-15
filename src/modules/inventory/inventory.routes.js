'use strict';
const { Router } = require('express');
const c = require('./inventory.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

/** @swagger
 * tags:
 *   name: Inventory
 *   description: Stock management operations
 */
router.post('/stock-in', c.addStock);
router.post('/stock-out', c.removeStock);
router.post('/adjust', c.adjustStock);
router.get('/transactions', c.getTransactions);
router.get('/supplier-stats', c.getSupplierStats);

module.exports = router;

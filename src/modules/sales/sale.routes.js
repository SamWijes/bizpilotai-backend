'use strict';
const { Router } = require('express');
const c = require('./sale.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

/** @swagger
 * tags:
 *   name: Sales
 *   description: Sales management
 */
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.patch('/:id/cancel', c.cancel);

module.exports = router;

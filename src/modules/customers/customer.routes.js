'use strict';
const { Router } = require('express');
const c = require('./customer.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

/** @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

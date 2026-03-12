'use strict';
const { Router } = require('express');
const c = require('./invoice.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

/** @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and PDF generation
 */
router.get('/', c.list);
router.get('/:id', c.getOne);
router.get('/:id/pdf', c.downloadPDF);
router.patch('/:id/status', c.updateStatus);

module.exports = router;

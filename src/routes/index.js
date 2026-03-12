'use strict';
const { Router } = require('express');

const router = Router();

// ── Module Routes ──────────────────────────────────────────────────────────
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/business', require('../modules/business/business.routes'));
router.use('/users', require('../modules/users/user.routes'));
router.use('/customers', require('../modules/customers/customer.routes'));
router.use('/suppliers', require('../modules/suppliers/supplier.routes'));
router.use('/products', require('../modules/products/product.routes'));
router.use('/inventory', require('../modules/inventory/inventory.routes'));
router.use('/sales', require('../modules/sales/sale.routes'));
router.use('/invoices', require('../modules/invoices/invoice.routes'));
router.use('/finance', require('../modules/expenses/expense.routes'));
router.use('/reports', require('../modules/reports/report.routes'));
router.use('/ai', require('../modules/ai/ai.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));

module.exports = router;

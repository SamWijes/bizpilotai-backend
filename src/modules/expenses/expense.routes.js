'use strict';
const { Router } = require('express');
const c = require('./expense.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

// Expenses
router.get('/expenses', c.listExpenses);
router.post('/expenses', c.createExpense);
router.put('/expenses/:id', c.updateExpense);
router.delete('/expenses/:id', c.deleteExpense);

// Income
router.get('/income', c.listIncome);
router.post('/income', c.createIncome);
router.put('/income/:id', c.updateIncome);
router.delete('/income/:id', c.deleteIncome);

module.exports = router;

'use strict';
const { Router } = require('express');
const c = require('./product.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isBusiness } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isBusiness);

router.get('/', c.list);
router.post('/', c.create);
router.get('/low-stock', c.getLowStock);
router.get('/categories', c.getCategories);
router.post('/categories', c.createCategory);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

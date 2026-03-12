'use strict';
const { Router } = require('express');
const c = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isOwner } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, scopeBusiness, isOwner);

router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.patch('/:id/deactivate', c.deactivate);

module.exports = router;

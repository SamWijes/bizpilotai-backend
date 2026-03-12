'use strict';
const { Router } = require('express');
const c = require('./business.controller');
const authenticate = require('../../middleware/authenticate');
const { scopeBusiness, isOwner } = require('../../middleware/authorize');

const router = Router();

router.use(authenticate, scopeBusiness);

/** @swagger
 * tags:
 *   name: Business
 *   description: Business profile and settings
 */
router.get('/profile', c.getProfile);
router.put('/profile', isOwner, c.updateProfile);
router.get('/settings', c.getSettings);
router.put('/settings', isOwner, c.updateSettings);

module.exports = router;

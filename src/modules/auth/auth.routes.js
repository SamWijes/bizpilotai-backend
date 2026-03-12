'use strict';
const { Router } = require('express');
const controller = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { authRateLimiter } = require('../../middleware/rateLimiter');
const {
    registerSchema, loginSchema, changePasswordSchema, refreshSchema,
} = require('../../validators/auth.validator');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user account management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new business and owner account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, businessEmail, name, email, password]
 *             properties:
 *               businessName: { type: string, example: "Samit's Store" }
 *               businessEmail: { type: string, example: "store@example.com" }
 *               name: { type: string, example: "Samit" }
 *               email: { type: string, example: "owner@example.com" }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Business and owner account created }
 *       409: { description: Email already in use }
 */
router.post('/register', authRateLimiter, validate(registerSchema), controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 */
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 *     security: []
 */
router.post('/refresh', validate(refreshSchema), controller.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidate refresh token)
 */
router.post('/logout', authenticate, controller.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 */
router.get('/profile', authenticate, controller.getProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change own password
 */
router.put('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

module.exports = router;

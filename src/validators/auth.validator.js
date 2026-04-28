'use strict';
const Joi = require('joi');

const registerSchema = Joi.object({
    businessName: Joi.string().min(2).max(200).required(),
    businessEmail: Joi.string().email().required(),
    businessPhone: Joi.string().max(50).optional().allow(''),
    name: Joi.string().min(2).max(200).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    currency: Joi.string().max(10).default('USD'),
    timezone: Joi.string().max(100).default('UTC'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({ 'any.only': 'Passwords do not match' }),
});

const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema, refreshSchema };

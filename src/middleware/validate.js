'use strict';
const Joi = require('joi');
const { error } = require('../utils/response');

/**
 * Factory: returns an Express middleware that validates req[property] against schema.
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} property
 */
const validate = (schema, property = 'body') => (req, res, next) => {
    const { error: joiError, value } = schema.validate(req[property], {
        abortEarly: false, // collect all errors
        stripUnknown: true, // remove extra fields
        convert: true,
    });

    if (joiError) {
        const errors = joiError.details.map((d) => ({
            field: d.context?.key || d.path.join('.'),
            message: d.message,
        }));
        return error(res, { message: 'Validation failed', statusCode: 422, errors });
    }

    req[property] = value; // replace with sanitized value
    next();
};

module.exports = validate;

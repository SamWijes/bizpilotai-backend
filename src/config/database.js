'use strict';
require('dotenv').config();

/**
 * Sequelize database configuration
 * Supports development, test, and production environments.
 */
module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || 'bizpilotai',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
            min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
        },
        define: {
            underscored: false,
            timestamps: true,
        },
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME + '_test' || 'bizpilotai_test',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false,
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
            min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: {
            ssl: {
                rejectUnauthorized: true,
            },
        },
    },
};

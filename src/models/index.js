'use strict';

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool,
        define: config.define,
        dialectOptions: config.dialectOptions || {},
    }
);

// ─────────────────────────────────────────────
// Import all models
// ─────────────────────────────────────────────
const SubscriptionPlan = require('./SubscriptionPlan')(sequelize);
const Business = require('./Business')(sequelize);
const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Supplier = require('./Supplier')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const InventoryTransaction = require('./InventoryTransaction')(sequelize);
const Sale = require('./Sale')(sequelize);
const SaleItem = require('./SaleItem')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const Expense = require('./Expense')(sequelize);
const Income = require('./Income')(sequelize);
const AiUsageLog = require('./AiUsageLog')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);

const models = {
    SubscriptionPlan,
    Business,
    User,
    Customer,
    Supplier,
    Category,
    Product,
    InventoryTransaction,
    Sale,
    SaleItem,
    Invoice,
    Expense,
    Income,
    AiUsageLog,
    ActivityLog,
};

// ─────────────────────────────────────────────
// Run all model associations
// ─────────────────────────────────────────────
Object.values(models).forEach((model) => {
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

module.exports = { sequelize, Sequelize, ...models };

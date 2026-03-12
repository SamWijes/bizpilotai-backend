'use strict';
const { Model, DataTypes } = require('sequelize');
const { BUSINESS_STATUS } = require('../config/constants');

module.exports = (sequelize) => {
    class Business extends Model {
        static associate(models) {
            Business.belongsTo(models.SubscriptionPlan, {
                foreignKey: 'subscriptionPlanId',
                as: 'subscriptionPlan',
            });
            Business.hasMany(models.User, { foreignKey: 'businessId', as: 'users' });
            Business.hasMany(models.Customer, { foreignKey: 'businessId', as: 'customers' });
            Business.hasMany(models.Supplier, { foreignKey: 'businessId', as: 'suppliers' });
            Business.hasMany(models.Category, { foreignKey: 'businessId', as: 'categories' });
            Business.hasMany(models.Product, { foreignKey: 'businessId', as: 'products' });
            Business.hasMany(models.Sale, { foreignKey: 'businessId', as: 'sales' });
            Business.hasMany(models.Invoice, { foreignKey: 'businessId', as: 'invoices' });
            Business.hasMany(models.Expense, { foreignKey: 'businessId', as: 'expenses' });
            Business.hasMany(models.Income, { foreignKey: 'businessId', as: 'incomes' });
            Business.hasMany(models.AiUsageLog, { foreignKey: 'businessId', as: 'aiUsageLogs' });
            Business.hasMany(models.ActivityLog, { foreignKey: 'businessId', as: 'activityLogs' });
            Business.hasMany(models.InventoryTransaction, {
                foreignKey: 'businessId',
                as: 'inventoryTransactions',
            });
        }
    }

    Business.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            subscriptionPlanId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'SubscriptionPlans', key: 'id' },
            },
            name: { type: DataTypes.STRING(200), allowNull: false },
            email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
            phone: { type: DataTypes.STRING(50) },
            address: { type: DataTypes.TEXT },
            logo: { type: DataTypes.STRING(500) }, // URL
            website: { type: DataTypes.STRING(300) },
            currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
            timezone: { type: DataTypes.STRING(100), defaultValue: 'UTC' },
            taxRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.0 },
            status: {
                type: DataTypes.ENUM(...Object.values(BUSINESS_STATUS)),
                defaultValue: BUSINESS_STATUS.TRIAL,
            },
            trialEndsAt: { type: DataTypes.DATE },
            settings: {
                type: DataTypes.JSON,
                defaultValue: {},
                comment: 'Flexible key-value business settings',
            },
        },
        {
            sequelize,
            modelName: 'Business',
            tableName: 'Businesses',
            timestamps: true,
        }
    );

    return Business;
};

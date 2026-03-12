'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SubscriptionPlan extends Model {
        static associate(models) {
            SubscriptionPlan.hasMany(models.Business, {
                foreignKey: 'subscriptionPlanId',
                as: 'businesses',
            });
        }
    }

    SubscriptionPlan.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(100), allowNull: false },
            description: { type: DataTypes.TEXT },
            maxUsers: { type: DataTypes.INTEGER, defaultValue: 3 },
            maxProducts: { type: DataTypes.INTEGER, defaultValue: 100 },
            aiRequestsPerMonth: { type: DataTypes.INTEGER, defaultValue: 50 },
            price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
            billingCycle: {
                type: DataTypes.ENUM('MONTHLY', 'YEARLY', 'LIFETIME'),
                defaultValue: 'MONTHLY',
            },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'SubscriptionPlan',
            tableName: 'SubscriptionPlans',
            timestamps: true,
        }
    );

    return SubscriptionPlan;
};

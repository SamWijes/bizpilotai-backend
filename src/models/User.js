'use strict';
const { Model, DataTypes } = require('sequelize');
const { ROLES } = require('../config/constants');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            User.hasMany(models.Sale, { foreignKey: 'userId', as: 'sales' });
            User.hasMany(models.Expense, { foreignKey: 'userId', as: 'expenses' });
            User.hasMany(models.AiUsageLog, { foreignKey: 'userId', as: 'aiUsageLogs' });
            User.hasMany(models.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
            User.hasMany(models.InventoryTransaction, { foreignKey: 'userId', as: 'inventoryTransactions' });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            businessId: {
                type: DataTypes.UUID,
                allowNull: true, // NULL for platform admins
                references: { model: 'Businesses', key: 'id' },
                onDelete: 'CASCADE',
            },
            name: { type: DataTypes.STRING(200), allowNull: false },
            email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING(255), allowNull: false },
            role: {
                type: DataTypes.ENUM(...Object.values(ROLES)),
                defaultValue: ROLES.STAFF,
                allowNull: false,
            },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
            refreshToken: { type: DataTypes.TEXT, allowNull: true },
            phoneNumber: { type: DataTypes.STRING(50) },
            avatar: { type: DataTypes.STRING(500) },
            lastLoginAt: { type: DataTypes.DATE },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
            timestamps: true,
            defaultScope: {
                attributes: { exclude: ['passwordHash', 'refreshToken'] },
            },
            scopes: {
                withPassword: { attributes: {} }, // include all
            },
        }
    );

    return User;
};

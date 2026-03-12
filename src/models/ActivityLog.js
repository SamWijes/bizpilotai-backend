'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ActivityLog extends Model {
        static associate(models) {
            ActivityLog.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    ActivityLog.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'SET NULL',
            },
            userId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' }, onDelete: 'SET NULL',
            },
            action: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: 'e.g. SALE_CREATED, PRODUCT_UPDATED',
            },
            entity: { type: DataTypes.STRING(100), comment: 'Model name, e.g. Sale, Product' },
            entityId: { type: DataTypes.STRING(100) },
            description: { type: DataTypes.TEXT },
            metadata: { type: DataTypes.JSON, defaultValue: {} },
            ipAddress: { type: DataTypes.STRING(50) },
        },
        {
            sequelize,
            modelName: 'ActivityLog',
            tableName: 'ActivityLogs',
            timestamps: true,
            updatedAt: false, // Logs are append-only
        }
    );

    return ActivityLog;
};

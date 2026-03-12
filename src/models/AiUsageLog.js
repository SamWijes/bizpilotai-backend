'use strict';
const { Model, DataTypes } = require('sequelize');
const { AI_PROMPT_TYPE } = require('../config/constants');

module.exports = (sequelize) => {
    class AiUsageLog extends Model {
        static associate(models) {
            AiUsageLog.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            AiUsageLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    AiUsageLog.init(
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
            promptType: {
                type: DataTypes.ENUM(...Object.values(AI_PROMPT_TYPE)),
                allowNull: false,
            },
            model: { type: DataTypes.STRING(100), comment: 'e.g. gpt-4o-mini' },
            prompt: { type: DataTypes.TEXT },
            response: { type: DataTypes.TEXT },
            tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
            promptTokens: { type: DataTypes.INTEGER, defaultValue: 0 },
            completionTokens: { type: DataTypes.INTEGER, defaultValue: 0 },
            durationMs: { type: DataTypes.INTEGER, defaultValue: 0 },
            isSuccess: { type: DataTypes.BOOLEAN, defaultValue: true },
            errorMessage: { type: DataTypes.TEXT },
        },
        {
            sequelize,
            modelName: 'AiUsageLog',
            tableName: 'AiUsageLogs',
            timestamps: true,
        }
    );

    return AiUsageLog;
};

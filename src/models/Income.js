'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Income extends Model {
        static associate(models) {
            Income.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Income.belongsTo(models.User, { foreignKey: 'userId', as: 'createdBy' });
        }
    }

    Income.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'CASCADE',
            },
            userId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
            },
            description: { type: DataTypes.STRING(500), allowNull: false },
            amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
            date: { type: DataTypes.DATEONLY, allowNull: false },
            source: { type: DataTypes.STRING(200), comment: 'e.g. Sales, Rental, Grant, etc.' },
            notes: { type: DataTypes.TEXT },
        },
        {
            sequelize,
            modelName: 'Income',
            tableName: 'Incomes',
            timestamps: true,
        }
    );

    return Income;
};

'use strict';
const { Model, DataTypes } = require('sequelize');
const { PAYMENT_METHOD } = require('../config/constants');

module.exports = (sequelize) => {
    class Expense extends Model {
        static associate(models) {
            Expense.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Expense.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
            Expense.belongsTo(models.User, { foreignKey: 'userId', as: 'createdBy' });
        }
    }

    Expense.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'CASCADE',
            },
            categoryId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Categories', key: 'id' },
            },
            userId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
            },
            description: { type: DataTypes.STRING(500), allowNull: false },
            amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
            date: { type: DataTypes.DATEONLY, allowNull: false },
            paymentMethod: {
                type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
                defaultValue: PAYMENT_METHOD.CASH,
            },
            receipt: { type: DataTypes.STRING(500), comment: 'URL to uploaded receipt image' },
            notes: { type: DataTypes.TEXT },
        },
        {
            sequelize,
            modelName: 'Expense',
            tableName: 'Expenses',
            timestamps: true,
        }
    );

    return Expense;
};

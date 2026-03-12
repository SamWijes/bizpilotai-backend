'use strict';
const { Model, DataTypes } = require('sequelize');
const { INVENTORY_TRANSACTION_TYPE } = require('../config/constants');

module.exports = (sequelize) => {
    class InventoryTransaction extends Model {
        static associate(models) {
            InventoryTransaction.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            InventoryTransaction.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
            InventoryTransaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    InventoryTransaction.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'CASCADE',
            },
            productId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Products', key: 'id' },
            },
            userId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
            },
            type: {
                type: DataTypes.ENUM(...Object.values(INVENTORY_TRANSACTION_TYPE)),
                allowNull: false,
            },
            quantity: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
            balanceBefore: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
            balanceAfter: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
            reason: { type: DataTypes.STRING(300) },
            referenceId: {
                type: DataTypes.STRING(100),
                comment: 'saleId or purchase order ID',
            },
            notes: { type: DataTypes.TEXT },
        },
        {
            sequelize,
            modelName: 'InventoryTransaction',
            tableName: 'InventoryTransactions',
            timestamps: true,
        }
    );

    return InventoryTransaction;
};

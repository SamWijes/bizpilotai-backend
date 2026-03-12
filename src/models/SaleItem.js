'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SaleItem extends Model {
        static associate(models) {
            SaleItem.belongsTo(models.Sale, { foreignKey: 'saleId', as: 'sale' });
            SaleItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
        }
    }

    SaleItem.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            saleId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Sales', key: 'id' }, onDelete: 'CASCADE',
            },
            productId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Products', key: 'id' },
            },
            productName: {
                type: DataTypes.STRING(300),
                comment: 'Snapshot of product name at time of sale',
            },
            quantity: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
            unitPrice: {
                type: DataTypes.DECIMAL(15, 4), allowNull: false,
                comment: 'Selling price snapshot at time of sale',
            },
            discount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
            total: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        },
        {
            sequelize,
            modelName: 'SaleItem',
            tableName: 'SaleItems',
            timestamps: true,
        }
    );

    return SaleItem;
};

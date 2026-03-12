'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
            Product.belongsTo(models.Supplier, { foreignKey: 'supplierId', as: 'supplier' });
            Product.hasMany(models.SaleItem, { foreignKey: 'productId', as: 'saleItems' });
            Product.hasMany(models.InventoryTransaction, { foreignKey: 'productId', as: 'inventoryTransactions' });
        }
    }

    Product.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onDelete: 'CASCADE',
            },
            categoryId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: 'Categories', key: 'id' },
            },
            supplierId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: 'Suppliers', key: 'id' },
            },
            name: { type: DataTypes.STRING(300), allowNull: false },
            description: { type: DataTypes.TEXT },
            sku: { type: DataTypes.STRING(100) },
            barcode: { type: DataTypes.STRING(100), comment: 'Placeholder for future barcode scanner' },
            unit: { type: DataTypes.STRING(50), defaultValue: 'pcs', comment: 'e.g. pcs, kg, L, box' },
            buyingPrice: { type: DataTypes.DECIMAL(15, 4), allowNull: false, defaultValue: 0 },
            sellingPrice: { type: DataTypes.DECIMAL(15, 4), allowNull: false, defaultValue: 0 },
            quantity: { type: DataTypes.DECIMAL(15, 4), defaultValue: 0, comment: 'Current stock level' },
            reorderLevel: { type: DataTypes.DECIMAL(15, 4), defaultValue: 0 },
            imageUrl: { type: DataTypes.STRING(500) },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'Product',
            tableName: 'Products',
            timestamps: true,
            indexes: [
                { unique: true, fields: ['businessId', 'sku'], name: 'products_business_sku_unique' },
            ],
        }
    );

    return Product;
};

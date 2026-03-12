'use strict';
const { Model, DataTypes } = require('sequelize');
const { SALE_STATUS, PAYMENT_METHOD } = require('../config/constants');

module.exports = (sequelize) => {
    class Sale extends Model {
        static associate(models) {
            Sale.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Sale.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
            Sale.belongsTo(models.User, { foreignKey: 'userId', as: 'createdBy' });
            Sale.hasMany(models.SaleItem, { foreignKey: 'saleId', as: 'items' });
            Sale.hasOne(models.Invoice, { foreignKey: 'saleId', as: 'invoice' });
        }
    }

    Sale.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'CASCADE',
            },
            customerId: {
                type: DataTypes.UUID, allowNull: true,
                references: { model: 'Customers', key: 'id' },
            },
            userId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Users', key: 'id' },
            },
            saleNumber: { type: DataTypes.STRING(50), allowNull: false },
            subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            discountAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
            taxRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
            taxAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
            total: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            paymentMethod: {
                type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
                defaultValue: PAYMENT_METHOD.CASH,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(SALE_STATUS)),
                defaultValue: SALE_STATUS.COMPLETED,
            },
            notes: { type: DataTypes.TEXT },
            saleDate: { type: DataTypes.DATEONLY, allowNull: false },
        },
        {
            sequelize,
            modelName: 'Sale',
            tableName: 'Sales',
            timestamps: true,
            indexes: [
                { unique: true, fields: ['businessId', 'saleNumber'], name: 'sales_business_number_unique' },
            ],
        }
    );

    return Sale;
};

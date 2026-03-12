'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Customer extends Model {
        static associate(models) {
            Customer.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Customer.hasMany(models.Sale, { foreignKey: 'customerId', as: 'sales' });
        }
    }

    Customer.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onDelete: 'CASCADE',
            },
            name: { type: DataTypes.STRING(200), allowNull: false },
            email: { type: DataTypes.STRING(200) },
            phone: { type: DataTypes.STRING(50) },
            address: { type: DataTypes.TEXT },
            city: { type: DataTypes.STRING(100) },
            country: { type: DataTypes.STRING(100) },
            notes: { type: DataTypes.TEXT },
            totalPurchases: {
                type: DataTypes.DECIMAL(15, 2),
                defaultValue: 0.0,
                comment: 'Cached total — updated on sale creation',
            },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'Customer',
            tableName: 'Customers',
            timestamps: true,
        }
    );

    return Customer;
};

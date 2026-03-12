'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Supplier extends Model {
        static associate(models) {
            Supplier.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Supplier.hasMany(models.Product, { foreignKey: 'supplierId', as: 'products' });
        }
    }

    Supplier.init(
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
            contactPerson: { type: DataTypes.STRING(200) },
            website: { type: DataTypes.STRING(300) },
            notes: { type: DataTypes.TEXT },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'Supplier',
            tableName: 'Suppliers',
            timestamps: true,
        }
    );

    return Supplier;
};

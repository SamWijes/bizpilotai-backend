'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Item extends Model {
        static associate(models) {
            Item.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Item.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
        }
    }

    Item.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        businessId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true },
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pcs',
        },
    }, {
        sequelize,
        modelName: 'Item',
        tableName: 'Items',
        indexes: [
            {
                unique: true,
                fields: ['businessId', 'sku'],
            },
        ],
    });

    return Item;
};

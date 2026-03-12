'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Category extends Model {
        static associate(models) {
            Category.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
        }
    }

    Category.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onDelete: 'CASCADE',
            },
            name: { type: DataTypes.STRING(100), allowNull: false },
            description: { type: DataTypes.TEXT },
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'Categories',
            timestamps: true,
        }
    );

    return Category;
};

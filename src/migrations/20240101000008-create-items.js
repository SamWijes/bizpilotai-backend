'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Items', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            businessId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            categoryId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'Categories', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            sku: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            unit: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'pcs',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        // Unique SKU per business
        await queryInterface.addIndex('Items', ['businessId', 'sku'], {
            unique: true,
            name: 'items_business_sku_unique',
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Items');
    },
};

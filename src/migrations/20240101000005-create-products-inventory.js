'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Categories', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        await queryInterface.createTable('Products', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            categoryId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Categories', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            supplierId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Suppliers', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'RESTRICT',
            },
            name: { type: Sequelize.STRING(300), allowNull: false },
            description: { type: Sequelize.TEXT },
            sku: { type: Sequelize.STRING(100) },
            barcode: { type: Sequelize.STRING(100) },
            unit: { type: Sequelize.STRING(50), defaultValue: 'pcs' },
            buyingPrice: { type: Sequelize.DECIMAL(15, 4), allowNull: false, defaultValue: 0 },
            sellingPrice: { type: Sequelize.DECIMAL(15, 4), allowNull: false, defaultValue: 0 },
            quantity: { type: Sequelize.DECIMAL(15, 4), defaultValue: 0 },
            reorderLevel: { type: Sequelize.DECIMAL(15, 4), defaultValue: 0 },
            imageUrl: { type: Sequelize.STRING(500) },
            isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Products', ['businessId'], { name: 'products_business_idx' });
        await queryInterface.addIndex('Products', ['businessId', 'sku'], {
            unique: true, name: 'products_business_sku_unique',
        });

        await queryInterface.createTable('InventoryTransactions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            productId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Products', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            type: { type: Sequelize.ENUM('IN', 'OUT', 'ADJUSTMENT'), allowNull: false },
            quantity: { type: Sequelize.DECIMAL(15, 4), allowNull: false },
            balanceBefore: { type: Sequelize.DECIMAL(15, 4), allowNull: false },
            balanceAfter: { type: Sequelize.DECIMAL(15, 4), allowNull: false },
            reason: { type: Sequelize.STRING(300) },
            referenceId: { type: Sequelize.STRING(100) },
            notes: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('InventoryTransactions', ['businessId', 'productId'], {
            name: 'inventory_business_product_idx',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('InventoryTransactions');
        await queryInterface.dropTable('Products');
        await queryInterface.dropTable('Categories');
    },
};

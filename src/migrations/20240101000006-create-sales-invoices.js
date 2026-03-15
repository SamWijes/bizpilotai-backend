'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Sales', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            customerId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Customers', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            saleNumber: { type: Sequelize.STRING(50), allowNull: false },
            subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            discountAmount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            taxRate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            taxAmount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            total: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            paymentMethod: {
                type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'OTHER'),
                defaultValue: 'CASH',
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'),
                defaultValue: 'COMPLETED',
            },
            notes: { type: Sequelize.TEXT },
            saleDate: { type: Sequelize.DATEONLY, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Sales', ['businessId', 'saleNumber'], {
            unique: true, name: 'sales_business_number_unique',
        });
        await queryInterface.addIndex('Sales', ['businessId', 'saleDate'], {
            name: 'sales_business_date_idx',
        });

        await queryInterface.createTable('SaleItems', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            saleId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Sales', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            productId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Products', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'RESTRICT',
            },
            productName: { type: Sequelize.STRING(300) },
            quantity: { type: Sequelize.DECIMAL(15, 4), allowNull: false },
            unitPrice: { type: Sequelize.DECIMAL(15, 4), allowNull: false },
            discount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            total: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        await queryInterface.createTable('Invoices', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            saleId: {
                type: Sequelize.UUID, allowNull: false, unique: true,
                references: { model: 'Sales', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            invoiceNumber: { type: Sequelize.STRING(50), allowNull: false },
            dueDate: { type: Sequelize.DATEONLY },
            status: {
                type: Sequelize.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'),
                defaultValue: 'DRAFT',
            },
            notes: { type: Sequelize.TEXT },
            pdfPath: { type: Sequelize.STRING(500) },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Invoices', ['businessId', 'invoiceNumber'], {
            unique: true, name: 'invoices_business_number_unique',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Invoices');
        await queryInterface.dropTable('SaleItems');
        await queryInterface.dropTable('Sales');
    },
};

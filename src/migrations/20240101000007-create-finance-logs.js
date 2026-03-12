'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Expenses', {
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
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            description: { type: Sequelize.STRING(500), allowNull: false },
            amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            paymentMethod: {
                type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'OTHER'),
                defaultValue: 'CASH',
            },
            receipt: { type: Sequelize.STRING(500) },
            notes: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Expenses', ['businessId', 'date'], { name: 'expenses_business_date_idx' });

        await queryInterface.createTable('Incomes', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            description: { type: Sequelize.STRING(500), allowNull: false },
            amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            source: { type: Sequelize.STRING(200) },
            notes: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Incomes', ['businessId', 'date'], { name: 'incomes_business_date_idx' });

        await queryInterface.createTable('AiUsageLogs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            promptType: {
                type: Sequelize.ENUM('INSIGHT', 'EMAIL', 'INVOICE_SUMMARY', 'SOCIAL_POST', 'CHAT'),
                allowNull: false,
            },
            model: { type: Sequelize.STRING(100) },
            prompt: { type: Sequelize.TEXT },
            response: { type: Sequelize.TEXT },
            tokensUsed: { type: Sequelize.INTEGER, defaultValue: 0 },
            promptTokens: { type: Sequelize.INTEGER, defaultValue: 0 },
            completionTokens: { type: Sequelize.INTEGER, defaultValue: 0 },
            durationMs: { type: Sequelize.INTEGER, defaultValue: 0 },
            isSuccess: { type: Sequelize.BOOLEAN, defaultValue: true },
            errorMessage: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        await queryInterface.createTable('ActivityLogs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            userId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            action: { type: Sequelize.STRING(100), allowNull: false },
            entity: { type: Sequelize.STRING(100) },
            entityId: { type: Sequelize.STRING(100) },
            description: { type: Sequelize.TEXT },
            metadata: { type: Sequelize.JSON },
            ipAddress: { type: Sequelize.STRING(50) },
            createdAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('ActivityLogs', ['businessId'], { name: 'activity_business_idx' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('ActivityLogs');
        await queryInterface.dropTable('AiUsageLogs');
        await queryInterface.dropTable('Incomes');
        await queryInterface.dropTable('Expenses');
    },
};

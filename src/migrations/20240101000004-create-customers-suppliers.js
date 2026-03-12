'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Customers', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            name: { type: Sequelize.STRING(200), allowNull: false },
            email: { type: Sequelize.STRING(200) },
            phone: { type: Sequelize.STRING(50) },
            address: { type: Sequelize.TEXT },
            city: { type: Sequelize.STRING(100) },
            country: { type: Sequelize.STRING(100) },
            notes: { type: Sequelize.TEXT },
            totalPurchases: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.0 },
            isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Customers', ['businessId'], { name: 'customers_business_idx' });

        await queryInterface.createTable('Suppliers', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            name: { type: Sequelize.STRING(200), allowNull: false },
            email: { type: Sequelize.STRING(200) },
            phone: { type: Sequelize.STRING(50) },
            address: { type: Sequelize.TEXT },
            contactPerson: { type: Sequelize.STRING(200) },
            website: { type: Sequelize.STRING(300) },
            notes: { type: Sequelize.TEXT },
            isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Suppliers', ['businessId'], { name: 'suppliers_business_idx' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Suppliers');
        await queryInterface.dropTable('Customers');
    },
};

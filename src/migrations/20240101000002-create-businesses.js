'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Businesses', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            subscriptionPlanId: {
                type: Sequelize.INTEGER, allowNull: true,
                references: { model: 'SubscriptionPlans', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            name: { type: Sequelize.STRING(200), allowNull: false },
            email: { type: Sequelize.STRING(200), allowNull: false, unique: true },
            phone: { type: Sequelize.STRING(50) },
            address: { type: Sequelize.TEXT },
            logo: { type: Sequelize.STRING(500) },
            website: { type: Sequelize.STRING(300) },
            currency: { type: Sequelize.STRING(10), defaultValue: 'USD' },
            timezone: { type: Sequelize.STRING(100), defaultValue: 'UTC' },
            taxRate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0.0 },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'SUSPENDED', 'TRIAL'),
                defaultValue: 'TRIAL',
            },
            trialEndsAt: { type: Sequelize.DATE },
            settings: { type: Sequelize.JSON },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Businesses', ['email'], { name: 'businesses_email_idx' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Businesses');
    },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SubscriptionPlans', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT },
            maxUsers: { type: Sequelize.INTEGER, defaultValue: 3 },
            maxProducts: { type: Sequelize.INTEGER, defaultValue: 100 },
            aiRequestsPerMonth: { type: Sequelize.INTEGER, defaultValue: 50 },
            price: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.0 },
            billingCycle: {
                type: Sequelize.ENUM('MONTHLY', 'YEARLY', 'LIFETIME'),
                defaultValue: 'MONTHLY',
            },
            isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('SubscriptionPlans');
    },
};

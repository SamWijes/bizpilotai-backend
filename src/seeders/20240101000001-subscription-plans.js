'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();
        await queryInterface.bulkInsert('SubscriptionPlans', [
            {
                name: 'Free',
                description: 'Perfect for getting started',
                maxUsers: 2,
                maxProducts: 50,
                aiRequestsPerMonth: 20,
                price: 0.0,
                billingCycle: 'MONTHLY',
                isActive: true,
                createdAt: now,
                updatedAt: now,
            },
            {
                name: 'Starter',
                description: 'For growing businesses',
                maxUsers: 5,
                maxProducts: 500,
                aiRequestsPerMonth: 100,
                price: 29.99,
                billingCycle: 'MONTHLY',
                isActive: true,
                createdAt: now,
                updatedAt: now,
            },
            {
                name: 'Pro',
                description: 'Full-featured for established businesses',
                maxUsers: 20,
                maxProducts: 10000,
                aiRequestsPerMonth: 1000,
                price: 79.99,
                billingCycle: 'MONTHLY',
                isActive: true,
                createdAt: now,
                updatedAt: now,
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('SubscriptionPlans', null, {});
    },
};

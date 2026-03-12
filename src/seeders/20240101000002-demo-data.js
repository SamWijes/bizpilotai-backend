'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const adminId = uuidv4();

        // Platform admin (no businessId)
        await queryInterface.bulkInsert('Users', [
            {
                id: adminId,
                businessId: null,
                name: 'Platform Admin',
                email: 'admin@bizpilotai.com',
                passwordHash: await bcrypt.hash('Admin@1234!', 12),
                role: 'ADMIN',
                isActive: true,
                refreshToken: null,
                createdAt: now,
                updatedAt: now,
            },
        ]);

        // Demo business + owner
        const bizId = uuidv4();
        await queryInterface.bulkInsert('Businesses', [
            {
                id: bizId,
                subscriptionPlanId: 1, // Free plan
                name: "Demo Store",
                email: 'demo@bizpilotai.com',
                phone: '+1 555-0100',
                address: '123 Demo Street, Demo City',
                currency: 'USD',
                timezone: 'UTC',
                taxRate: 10.00,
                status: 'ACTIVE',
                settings: JSON.stringify({}),
                createdAt: now,
                updatedAt: now,
            },
        ]);

        const ownerId = uuidv4();
        await queryInterface.bulkInsert('Users', [
            {
                id: ownerId,
                businessId: bizId,
                name: 'Demo Owner',
                email: 'owner@demo.com',
                passwordHash: await bcrypt.hash('Owner@1234!', 12),
                role: 'OWNER',
                isActive: true,
                refreshToken: null,
                createdAt: now,
                updatedAt: now,
            },
        ]);

        // Demo categories
        const catId = uuidv4();
        await queryInterface.bulkInsert('Categories', [
            { id: catId, businessId: bizId, name: 'Electronics', description: 'Electronic goods', createdAt: now, updatedAt: now },
        ]);

        // Demo products
        await queryInterface.bulkInsert('Products', [
            {
                id: uuidv4(), businessId: bizId, categoryId: catId, supplierId: null,
                name: 'USB-C Cable', sku: 'ELC-001', unit: 'pcs',
                buyingPrice: 2.50, sellingPrice: 9.99,
                quantity: 100, reorderLevel: 10,
                isActive: true, createdAt: now, updatedAt: now,
            },
            {
                id: uuidv4(), businessId: bizId, categoryId: catId, supplierId: null,
                name: 'Wireless Mouse', sku: 'ELC-002', unit: 'pcs',
                buyingPrice: 8.00, sellingPrice: 24.99,
                quantity: 50, reorderLevel: 5,
                isActive: true, createdAt: now, updatedAt: now,
            },
            {
                id: uuidv4(), businessId: bizId, categoryId: catId, supplierId: null,
                name: 'HDMI Adapter', sku: 'ELC-003', unit: 'pcs',
                buyingPrice: 3.00, sellingPrice: 14.99,
                quantity: 3, reorderLevel: 10, // Low stock intentionally
                isActive: true, createdAt: now, updatedAt: now,
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Products', null, {});
        await queryInterface.bulkDelete('Categories', null, {});
        await queryInterface.bulkDelete('Users', null, {});
        await queryInterface.bulkDelete('Businesses', null, {});
    },
};

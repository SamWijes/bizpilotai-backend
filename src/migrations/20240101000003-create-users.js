'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            businessId: {
                type: Sequelize.UUID, allowNull: true,
                references: { model: 'Businesses', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            name: { type: Sequelize.STRING(200), allowNull: false },
            email: { type: Sequelize.STRING(200), allowNull: false, unique: true },
            passwordHash: { type: Sequelize.STRING(255), allowNull: false },
            role: { type: Sequelize.ENUM('OWNER', 'STAFF', 'ADMIN'), defaultValue: 'STAFF' },
            isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
            refreshToken: { type: Sequelize.TEXT },
            phoneNumber: { type: Sequelize.STRING(50) },
            avatar: { type: Sequelize.STRING(500) },
            lastLoginAt: { type: Sequelize.DATE },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        await queryInterface.addIndex('Users', ['email'], { name: 'users_email_idx' });
        await queryInterface.addIndex('Users', ['businessId'], { name: 'users_business_idx' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Users');
    },
};

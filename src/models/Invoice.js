'use strict';
const { Model, DataTypes } = require('sequelize');
const { INVOICE_STATUS } = require('../config/constants');

module.exports = (sequelize) => {
    class Invoice extends Model {
        static associate(models) {
            Invoice.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
            Invoice.belongsTo(models.Sale, { foreignKey: 'saleId', as: 'sale' });
        }
    }

    Invoice.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            businessId: {
                type: DataTypes.UUID, allowNull: false,
                references: { model: 'Businesses', key: 'id' }, onDelete: 'CASCADE',
            },
            saleId: {
                type: DataTypes.UUID, allowNull: false, unique: true,
                references: { model: 'Sales', key: 'id' },
            },
            invoiceNumber: { type: DataTypes.STRING(50), allowNull: false },
            dueDate: { type: DataTypes.DATEONLY },
            status: {
                type: DataTypes.ENUM(...Object.values(INVOICE_STATUS)),
                defaultValue: INVOICE_STATUS.DRAFT,
            },
            notes: { type: DataTypes.TEXT },
            pdfPath: { type: DataTypes.STRING(500), comment: 'Local or S3 path to cached PDF' },
        },
        {
            sequelize,
            modelName: 'Invoice',
            tableName: 'Invoices',
            timestamps: true,
            indexes: [
                { unique: true, fields: ['businessId', 'invoiceNumber'], name: 'invoices_business_number_unique' },
            ],
        }
    );

    return Invoice;
};

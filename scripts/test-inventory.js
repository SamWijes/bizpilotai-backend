require('dotenv').config();
const { Product, InventoryTransaction, Supplier } = require('../src/models');
const { INVENTORY_TRANSACTION_TYPE } = require('../src/config/constants');
const { sequelize } = require('../src/models');

async function run() {
    try {
        const t = await sequelize.transaction();

        console.log('Querying for first supplier...');
        const supplier = await Supplier.findOne();
        if (!supplier) {
            console.log('No supplier found!');
            return;
        }

        console.log('Creating a test product...');
        const product = await Product.create({
            businessId: supplier.businessId,
            supplierId: supplier.id,
            name: 'Test Dynamic Inventory Product',
            sku: 'TEST-DYN-01',
            buyingPrice: 10,
            sellingPrice: 20,
        }, { transaction: t });

        console.log('Initial product created with ID: ', product.id);

        console.log('Creating IN transaction +50...');
        await InventoryTransaction.create({
            businessId: supplier.businessId,
            productId: product.id,
            type: INVENTORY_TRANSACTION_TYPE.IN,
            quantity: 50,
            balanceBefore: 0,
            balanceAfter: 50,
            reason: 'Initial Stock'
        }, { transaction: t });

        console.log('Creating OUT transaction -10...');
        await InventoryTransaction.create({
            businessId: supplier.businessId,
            productId: product.id,
            type: INVENTORY_TRANSACTION_TYPE.OUT,
            quantity: 10,
            balanceBefore: 50,
            balanceAfter: 40,
            reason: 'Test Sale'
        }, { transaction: t });

        await t.commit();

        console.log('Fetching product with dynamic quantity...');
        const fetchedProduct = await Product.findOne({
            where: { id: product.id },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE -quantity END), 0)
                            FROM InventoryTransactions AS it
                            WHERE it.productId = Product.id
                        )`),
                        'computedQuantity'
                    ]
                ]
            }
        });

        console.log('Dynamically Computed Quantity:', fetchedProduct.toJSON().computedQuantity);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();

'use strict';
require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        
        await sequelize.authenticate();
        logger.info(' Database connection established successfully.');

        // Start HTTP server
        app.listen(PORT, () => {
            logger.info(` BizPilotAI server running on port ${PORT} [${process.env.NODE_ENV}]`);
            logger.info(` API Docs: http://localhost:${PORT}/api/docs`);
        });
    } catch (err) {
        logger.error('Unable to connect to database:', err);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

startServer();

'use strict';
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const swaggerSpec = require('./config/swagger');
const apiRouter = require('./routes');

const app = express();
app.set('trust proxy', 1);
// ─────────────────────────────────────────────
// Security middleware
// ─────────────────────────────────────────────
app.use(helmet());

// CORS
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    })
);

// ─────────────────────────────────────────────
// General middleware
// ─────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
    app.use(
        morgan('combined', {
            stream: { write: (msg) => logger.http(msg.trim()) },
        })
    );
}

// Global rate limiter
app.use(globalRateLimiter);

// ─────────────────────────────────────────────
// API Docs (Swagger)
// ─────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'BizPilotAI API Docs',
}));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', app: process.env.APP_NAME, env: process.env.NODE_ENV });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;

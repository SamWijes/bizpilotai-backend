'use strict';
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BizPilotAI API',
            version: '1.0.0',
            description: 'AI-Powered Business Management Suite for SMEs — REST API Documentation',
            contact: { name: 'BizPilotAI', email: 'admin@bizpilotai.com' },
        },
        servers: [
            { url: 'http://localhost:5000/api/v1', description: 'Development server' },
            { url: 'https://api.bizpilotai.com/api/v1', description: 'Production server' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    message: { type: 'string', example: 'Unauthorized' },
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.routes.js', './src/routes/*.js'],
};

module.exports = swaggerJsDoc(options);

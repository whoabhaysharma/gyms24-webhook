const express = require('express');
const webhookRoutes = require('./routes/webhook.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'WhatsApp Webhook Server',
        version: '1.0.0'
    });
});

app.use('/webhook', webhookRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

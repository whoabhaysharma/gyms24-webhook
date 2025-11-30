const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');

const PORT = config.server.port;

app.listen(PORT, () => {
    logger.log(`🚀 WhatsApp Webhook Server started`);
    logger.log(`📡 Listening on port ${PORT}`);
    logger.log(`🌍 Environment: ${config.server.env}`);
    logger.log(`✅ Ready to receive webhooks at /webhook`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const messageController = require('./controllers/messageController');

const app = express();

// Middleware
app.use(express.json());

// Webhook routes
const router = express.Router();
router.get('/', messageController.verifyWebhook);
router.post('/', messageController.handleIncomingMessage);

app.use('/webhook', router);

// Home route
app.get('/', (req, res) => {
    res.send('WhatsApp Webhook is running!');
});

// Start the server
app.listen(config.PORT, () => {
    logger.log(`Server is listening on port ${config.PORT}`);
});

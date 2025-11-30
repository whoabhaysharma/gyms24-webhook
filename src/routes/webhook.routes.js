const express = require('express');
const webhookController = require('../controllers/webhook.controller');

const router = express.Router();

/**
 * GET /webhook - Verify webhook
 */
router.get('/', (req, res) => webhookController.verifyWebhook(req, res));

/**
 * POST /webhook - Handle incoming messages
 */
router.post('/', (req, res) => webhookController.handleIncomingMessage(req, res));

module.exports = router;

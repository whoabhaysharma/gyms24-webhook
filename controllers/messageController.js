const config = require('../config');
const whatsappService = require('../services/whatsappService');
const { generateAccessCode } = require('../utils/generators');
const logger = require('../utils/logger');

/**
 * Handles incoming WhatsApp messages.
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
async function handleIncomingMessage(req, res) {
    logger.log("POST BODY:", JSON.stringify(req.body, null, 2));

    const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) {
        return res.status(200).send("NO_MSG");
    }

    const from = msg.from;

    // Case 1: User sent a text message
    if (msg.text) {
        const text = msg.text.body.trim().toLowerCase();
        if (text === "hi") {
            await whatsappService.sendWelcomeMessage(from);
        } else if (text === "paid") {
            const code = generateAccessCode();
            await whatsappService.sendConfirmationMessage(from, code);
        }
    }

    // Case 2: User selected an interactive reply button
    if (msg.interactive && msg.interactive.button_reply) {
        const id = msg.interactive.button_reply.id;
        if (id === "start_booking") {
            await whatsappService.sendGymList(from);
        }
    }

    // Case 3: User selected an item from a list
    if (msg.interactive && msg.interactive.list_reply) {
        const selectedId = msg.interactive.list_reply.id;

        const gym = config.GYMS.find(g => g.id === selectedId);
        if (gym) {
            await whatsappService.sendPlanList(from, gym);
        }

        const plan = config.PLANS.find(p => p.id === selectedId);
        if (plan) {
            await whatsappService.sendPaymentCTA(from, plan);
        }
    }

    res.status(200).send("OK");
}

/**
 * Handles webhook verification.
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
function verifyWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
        logger.log("Webhook verified successfully!");
        res.status(200).send(challenge);
    } else {
        logger.error("Webhook verification failed.");
        res.status(403).send("TOKEN_MISMATCH");
    }
}

module.exports = {
    handleIncomingMessage,
    verifyWebhook
};

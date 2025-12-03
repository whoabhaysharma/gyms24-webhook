const config = require('../config');
const whatsappService = require('../services/whatsapp.service');
const logger = require('../utils/logger');

const redis = require('../utils/redis');

/**
 * Webhook Controller - Handles incoming WhatsApp webhook requests
 */
class WebhookController {
    /**
     * Verify webhook (GET request from WhatsApp)
     */
    verifyWebhook(req, res) {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
            logger.log("Webhook verified successfully!");
            res.status(200).send(challenge);
        } else {
            logger.error("Webhook verification failed.");
            res.status(403).send("TOKEN_MISMATCH");
        }
    }

    /**
     * Handle incoming messages (POST request from WhatsApp)
     */
    async handleIncomingMessage(req, res) {
        logger.log("POST BODY:", JSON.stringify(req.body, null, 2));

        const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!msg) {
            return res.status(200).send("NO_MSG");
        }

        const from = msg.from; // Phone number

        try {
            // Handle text messages
            if (msg.text) {
                await this.handleTextMessage(from, msg.text.body);
            }

            // Handle button replies
            if (msg.interactive?.button_reply) {
                await this.handleButtonReply(from, msg.interactive.button_reply.id);
            }

            // Handle list selections
            if (msg.interactive?.list_reply) {
                await this.handleListReply(from, msg.interactive.list_reply.id);
            }

            res.status(200).send("OK");
        } catch (error) {
            logger.error("Error handling message:", error);
            res.status(200).send("ERROR");
        }
    }

    /**
     * Handle text messages
     */
    async handleTextMessage(from, text) {
        const normalizedText = text.trim().toLowerCase();

        if (["hi", "hello", "start"].includes(normalizedText)) {
            await whatsappService.sendWelcomeMessage(from);
        } else if (normalizedText === "status") {
            await whatsappService.sendSubscriptionStatus(from);
        } else if (normalizedText === "/otp" || normalizedText === "otp") {
            // Backend stores OTP against 10-digit number
            const phoneNumber = from.slice(-10);
            const otp = await redis.get(`otp:${phoneNumber}`);

            if (otp) {
                await whatsappService.sendOtp(from, otp);
            } else {
                await whatsappService.sendMessage({
                    messaging_product: "whatsapp",
                    to: from,
                    type: "text",
                    text: { body: "❌ No active OTP found. Please request a new one from the app." }
                });
            }
        }
    }

    /**
     * Handle button replies
     */
    async handleButtonReply(from, buttonId) {
        if (buttonId === "start_booking") {
            await whatsappService.sendGymList(from);
        } else if (buttonId === "check_status") {
            await whatsappService.sendSubscriptionStatus(from);
        }
    }

    /**
     * Handle list selections
     */
    async handleListReply(from, selectedId) {
        if (selectedId.startsWith("gym_")) {
            const gymId = selectedId.replace("gym_", "");
            await whatsappService.sendPlanList(from, gymId);
        } else if (selectedId.startsWith("plan_")) {
            // Format: plan_{gymId}_{planId}
            const parts = selectedId.split("_");
            if (parts.length >= 3) {
                const gymId = parts[1];
                const planId = parts[2];
                await whatsappService.sendBookingLink(from, gymId, planId);
            }
        }
    }
}

module.exports = new WebhookController();

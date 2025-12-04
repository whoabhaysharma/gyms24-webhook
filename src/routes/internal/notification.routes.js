const express = require('express');
const whatsappService = require('../../services/whatsapp.service');
const logger = require('../../utils/logger');
const config = require('../../config');

const router = express.Router();

// Middleware to verify internal secret
const verifyInternalSecret = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];
    if (!secret || secret !== config.backend.secret) {
        logger.error('Invalid internal secret attempt');
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
};

router.use(verifyInternalSecret);

/**
 * POST /internal/notify/access-code
 * Send access code to user via WhatsApp
 */
router.post('/access-code', async (req, res) => {
    try {
        const { mobile, accessCode, gymName, planName, endDate } = req.body;

        if (!mobile || !accessCode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Format mobile number (ensure it has country code if needed, or assume local)
        // For WhatsApp API, we usually need the full number. 
        // Assuming backend sends a clean number or we might need to prepend '91' if missing.
        // But let's assume the backend sends the correct format for now.

        await whatsappService.sendMessage({
            messaging_product: "whatsapp",
            to: mobile,
            type: "text",
            text: {
                body: `🎉 *Membership Activated!*

Welcome to *${gymName}*! 🏋️‍♂️

✅ *Plan:* ${planName}
📅 *Valid Until:* ${new Date(endDate).toLocaleDateString()}
🔑 *Your Access Code:* *${accessCode}*

Show this code at the reception to enter.
Happy training! 💪`
            }
        });

        res.json({ success: true });
    } catch (error) {
        logger.error('Error sending access code notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

module.exports = router;

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Helper function to send a WhatsApp message.
 * @param {object} payload The message payload.
 */
async function sendMessage(payload) {
    try {
        await axios.post(config.WHATSAPP_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        logger.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}

/**
 * Sends a welcome message.
 * @param {string} to The recipient's phone number.
 */
async function sendWelcomeMessage(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: {
                text: `👋 Hey there! Ready to crush your fitness goals?  
I can help you book a gym instantly. 💪  

Tap below to get started!`
            },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: "start_booking",
                            title: "🔥 Book a Gym"
                        }
                    }
                ]
            }
        }
    };
    await sendMessage(payload);
}

/**
 * Sends a list of gyms.
 * @param {string} to The recipient's phone number.
 */
async function sendGymList(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "Nearby Gyms 🏋️" },
            body: { text: "Choose a gym that suits your vibe and location:" },
            action: {
                button: "Select Gym",
                sections: [
                    {
                        title: "Available Gyms",
                        rows: config.GYMS.map(g => ({
                            id: g.id,
                            title: g.name
                        }))
                    }
                ]
            }
        }
    };
    await sendMessage(payload);
}

/**
 * Sends a list of plans for a specific gym.
 * @param {string} to The recipient's phone number.
 * @param {object} gym The selected gym.
 */
async function sendPlanList(to, gym) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: `${gym.name} Membership Plans` },
            body: {
                text: `Awesome choice! 💯  
Select a membership plan for *${gym.name}*:`
            },
            action: {
                button: "View Plans",
                sections: [
                    {
                        title: "Membership Options",
                        rows: config.PLANS.map(p => ({
                            id: p.id,
                            title: p.name,
                            description: `Only ₹${p.price}!`
                        }))
                    }
                ]
            }
        }
    };
    await sendMessage(payload);
}

/**
 * Sends a payment call-to-action button.
 * @param {string} to The recipient's phone number.
 * @param {object} plan The selected plan.
 */
async function sendPaymentCTA(to, plan) {
    const vpa = "abhaysharma.as2719-1@okicici";
    const paymentUrl = `upi://pay?pa=${vpa}&pn=GymPayment&am=${plan.price}&cu=INR`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: {
            type: "cta_url",
            header: {
                type: "text",
                text: `Pay for ${plan.name}`
            },
            body: {
                text: `You're just *one step away* from activating your membership! 😍  
Tap the button below to pay securely via UPI.`
            },
            footer: {
                text: "⚡ Instant activation after payment"
            },
            action: {
                name: "cta_url",
                parameters: {
                    display_text: "💳 Pay Now",
                    url: paymentUrl
                }
            }
        }
    };
    await sendMessage(payload);
}

/**
 * Sends a confirmation message with a unique code.
 * @param {string} to The recipient's phone number.
 * @param {string} code The unique access code.
 */
async function sendConfirmationMessage(to, code) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            body: `🎉 *Payment Successful!* 🎉  

Your membership has been activated.  

Here is your *Gym Access Code*:  
⭐ *${code}* ⭐  

Show this code at the gym entrance to start your workout journey!  
If you need anything, I’m always here to help. 💬🙂`
        }
    };
    await sendMessage(payload);
}

module.exports = {
    sendWelcomeMessage,
    sendGymList,
    sendPlanList,
    sendPaymentCTA,
    sendConfirmationMessage
};

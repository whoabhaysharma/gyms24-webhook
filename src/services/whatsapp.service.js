const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const backendService = require('./backend.service');

/**
 * WhatsApp Service - Handles all WhatsApp messaging operations
 */
class WhatsAppService {
    constructor() {
        this.apiUrl = config.whatsapp.apiUrl;
        this.token = config.whatsapp.token;
    }

    /**
     * Send a message via WhatsApp API
     */
    async sendMessage(payload) {
        try {
            await axios.post(this.apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            logger.error('Error sending message:', error.response ? error.response.data : error.message);
        }
    }

    /**
     * Send welcome message with action buttons
     */
    async sendWelcomeMessage(to) {
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
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "check_status",
                                title: "📋 My Status"
                            }
                        }
                    ]
                }
            }
        };
        await this.sendMessage(payload);
    }

    /**
     * Send list of available gyms
     */
    async sendGymList(to) {
        const gyms = await backendService.getGyms();

        if (gyms.length === 0) {
            await this.sendMessage({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: "Sorry, no gyms are available right now. 😔" }
            });
            return;
        }

        const rows = gyms.slice(0, 10).map(g => ({
            id: `gym_${g.id}`,
            title: g.name.substring(0, 24),
            description: g.address ? g.address.substring(0, 72) : ""
        }));

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
                            rows
                        }
                    ]
                }
            }
        };
        await this.sendMessage(payload);
    }

    /**
     * Send list of plans for a gym
     */
    async sendPlanList(to, gymId) {
        const plans = await backendService.getPlans(gymId);

        if (plans.length === 0) {
            await this.sendMessage({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: "Sorry, no plans available for this gym yet. 😔" }
            });
            return;
        }

        const rows = plans.slice(0, 10).map(p => ({
            id: `plan_${gymId}_${p.id}`,
            title: p.name.substring(0, 24),
            description: `₹${p.price} - ${p.durationValue} ${p.durationUnit}`.substring(0, 72)
        }));

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "Membership Plans" },
                body: {
                    text: `Awesome choice! 💯  
Select a membership plan:`
                },
                action: {
                    button: "View Plans",
                    sections: [
                        {
                            title: "Membership Options",
                            rows
                        }
                    ]
                }
            }
        };
        await this.sendMessage(payload);
    }

    /**
     * Send payment CTA with Razorpay link
     */
    async sendPaymentCTA(to, gymId, planId) {
        const result = await backendService.createSubscription(to, gymId, planId);

        if (!result) {
            await this.sendMessage({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: "Oops! Something went wrong creating your subscription. Please try again later. 😓" }
            });
            return;
        }

        const { paymentLink } = result;

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "interactive",
            interactive: {
                type: "cta_url",
                header: {
                    type: "text",
                    text: `Pay for Membership`
                },
                body: {
                    text: `You're just *one step away*! 😍  
Tap the button below to pay securely via Razorpay.`
                },
                footer: {
                    text: "⚡ Instant activation after payment"
                },
                action: {
                    name: "cta_url",
                    parameters: {
                        display_text: "💳 Pay Now",
                        url: paymentLink.short_url
                    }
                }
            }
        };
        await this.sendMessage(payload);
    }

    /**
     * Send subscription status
     */
    async sendSubscriptionStatus(to) {
        const sub = await backendService.checkSubscription(to);

        if (!sub) {
            await this.sendMessage({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: "You don't have any active subscriptions. Tap 'Book a Gym' to get started! 💪" }
            });
            return;
        }

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: `✅ *Active Subscription*  

📍 *Gym:* ${sub.gym.name}  
📅 *Plan:* ${sub.plan.name}  
⏳ *Expires:* ${new Date(sub.endDate).toLocaleDateString()}  
🔑 *Access Code:* *${sub.accessCode}*  

Show your access code at the gym entrance!`
            }
        };
        await this.sendMessage(payload);
    }
    /**
     * Send OTP
     */
    async sendOtp(to, otp) {
        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: `🔐 Your OTP is: *${otp}*

This code is valid for 5 minutes. Do not share it with anyone.`
            }
        };
        await this.sendMessage(payload);
    }
}

module.exports = new WhatsAppService();

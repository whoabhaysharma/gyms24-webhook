import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = 'v24.0'; // Or whatever version you are using

const client = axios.create({
    baseURL: `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`,
    headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

export const sendMessage = async (to: string, content: string | any) => {
    try {
        console.log(`[WhatsAppService] Sending message to: ${to}`);
        const payload: any = {
            messaging_product: 'whatsapp',
            to,
        };

        if (typeof content === 'string') {
            payload.type = 'text';
            payload.text = { body: content };
        } else {
            Object.assign(payload, content);
        }

        const response = await client.post('/messages', payload);
        console.log(`[WhatsAppService] Message sent successfully. ID: ${response.data.messages?.[0]?.id}`);
        return response.data;
    } catch (error: any) {
        console.error('[WhatsAppService] Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
};

export const markAsRead = async (messageId: string) => {
    try {
        console.log(`[WhatsAppService] Marking message as read: ${messageId}`);
        await client.post('/messages', {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        });
        console.log(`[WhatsAppService] Message marked as read`);
    } catch (error: any) {
        console.error('[WhatsAppService] Error marking message as read:', error.response?.data || error.message);
        // Don't throw here, it's not critical
    }
};

export const sendInteractiveButtons = async (to: string, bodyText: string, buttons: { id: string; title: string }[]) => {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: bodyText,
            },
            action: {
                buttons: buttons.map((btn) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id,
                        title: btn.title,
                    },
                })),
            },
        },
    };

    return sendMessage(to, payload);
};

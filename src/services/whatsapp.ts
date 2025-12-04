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
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

export const markAsRead = async (messageId: string) => {
    try {
        await client.post('/messages', {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        // Don't throw here, it's not critical
    }
};

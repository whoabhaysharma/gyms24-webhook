import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

const client = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'x-api-key': BACKEND_API_KEY,
        'Content-Type': 'application/json',
    },
});

export const processUserMessage = async (from: string, message: string, name: string) => {
    try {
        console.log(`[BackendService] Processing user message from: ${from}`);
        // This assumes your backend has an endpoint to handle the logic
        // Adjust the endpoint and payload as per your actual backend requirement
        const response = await client.post('/whatsapp/process', {
            from,
            message,
            name,
        });
        console.log(`[BackendService] Process response:`, response.data);
        return response.data;
    } catch (error) {
        console.error('[BackendService] Error processing message with backend:', error);
        throw error;
    }
};

export const getMagicLink = async (phoneNumber: string) => {
    try {
        console.log(`[BackendService] Fetching magic link for: ${phoneNumber}`);
        const response = await client.post('/auth/magic-link', { phoneNumber });
        console.log(`[BackendService] Magic link fetched successfully`);
        return response.data.data.magicLink;
    } catch (error) {
        console.error('[BackendService] Error fetching magic link:', error);
        return null;
    }
};

export const getUserByMobile = async (mobile: string) => {
    try {
        console.log(`[BackendService] Fetching user by mobile: ${mobile}`);
        const response = await client.get('/users', {
            params: { search: mobile, role: 'USER' }
        });
        if (response.data.data && response.data.data.length > 0) {
            console.log(`[BackendService] User found: ${response.data.data[0].id}`);
            return response.data.data[0];
        }
        console.log(`[BackendService] User not found for mobile: ${mobile}`);
        return null;
    } catch (error) {
        console.error('[BackendService] Error fetching user:', error);
        return null;
    }
};

export const getSubscriptions = async (userId: string) => {
    try {
        console.log(`[BackendService] Fetching subscriptions for user: ${userId}`);
        const response = await client.get('/subscriptions', {
            params: { userId, status: 'ACTIVE' }
        });
        console.log(`[BackendService] Found ${response.data.data.length} active subscriptions`);
        return response.data.data;
    } catch (error) {
        console.error('[BackendService] Error fetching subscriptions:', error);
        return [];
    }
};

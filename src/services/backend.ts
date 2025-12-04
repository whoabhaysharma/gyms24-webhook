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
        // This assumes your backend has an endpoint to handle the logic
        // Adjust the endpoint and payload as per your actual backend requirement
        const response = await client.post('/whatsapp/process', {
            from,
            message,
            name,
        });
        return response.data;
    } catch (error) {
        console.error('Error processing message with backend:', error);
        throw error;
    }
};

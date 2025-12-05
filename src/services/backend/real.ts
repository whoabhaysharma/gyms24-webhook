import axios, { AxiosInstance } from 'axios';
import { IBackendService, User, Subscription } from './interface';
import { config } from '../../config/config';
import { logWithContext } from '../../utils/logger';

export class RealBackendService implements IBackendService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.backend.url,
            headers: {
                'x-internal-secret': config.backend.internalSecret,
                'Content-Type': 'application/json',
            },
        });
    }

    async processUserMessage(from: string, message: string, name: string): Promise<any> {
        try {
            logWithContext('RealBackend', `Processing user message from: ${from}`);
            const response = await this.client.post('/whatsapp/process', { from, message, name });
            return response.data;
        } catch (error: any) {
            logWithContext('RealBackend', 'Error processing message', { error: error.message }, 'error');
            throw error;
        }
    }

    async getMagicLink(phoneNumber: string): Promise<string | null> {
        try {
            logWithContext('RealBackend', `Fetching magic link for: ${phoneNumber}`);
            const response = await this.client.post('/auth/magic-link', { phoneNumber });
            return response.data.data.magicLink;
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching magic link', { error: error.message }, 'error');
            return null;
        }
    }

    async getUserByMobile(mobile: string): Promise<User | null> {
        try {
            logWithContext('RealBackend', `Fetching user by mobile: ${mobile}`);
            const response = await this.client.get('/users', {
                params: { search: mobile, role: 'USER' }
            });
            // Response structure: { success: true, data: { data: [users], meta: ... } }
            if (response.data.data && response.data.data.data && response.data.data.data.length > 0) {
                const users = response.data.data.data;
                // Find exact match
                const exactMatch = users.find((u: User) => u.mobileNumber === mobile);
                if (exactMatch) {
                    return exactMatch;
                }
                // Fallback to first result if no exact match (though exact match is preferred)
                return users[0];
            }
            return null;
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching user', { error: error.message }, 'error');
            return null;
        }
    }

    async getSubscriptions(userId: string): Promise<Subscription[]> {
        try {
            logWithContext('RealBackend', `Fetching subscriptions for user: ${userId}`);
            const response = await this.client.get('/subscriptions', {
                params: { userId, status: 'ACTIVE' }
            });
            // Response structure: { success: true, data: { data: [subs], meta: ... } }
            return response.data.data?.data || [];
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching subscriptions', { error: error.message }, 'error');
            return [];
        }
    }
}

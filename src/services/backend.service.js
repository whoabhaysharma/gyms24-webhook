const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Backend Service - Handles all communication with the gym backend
 */
class BackendService {
    constructor() {
        this.baseUrl = config.backend.url;
        this.secret = config.backend.secret;
    }

    /**
     * Get request headers with authentication
     */
    getHeaders() {
        return {
            'x-whatsapp-secret': this.secret,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Fetch all gyms
     */
    async getGyms() {
        try {
            const response = await axios.get(`${this.baseUrl}/gyms`, {
                headers: this.getHeaders()
            });
            return response.data.data || [];
        } catch (error) {
            logger.error('Error fetching gyms:', error.message);
            return [];
        }
    }

    /**
     * Fetch plans for a specific gym
     */
    async getPlans(gymId) {
        try {
            const response = await axios.get(`${this.baseUrl}/plans`, {
                params: { gymId },
                headers: this.getHeaders()
            });
            return response.data.data || [];
        } catch (error) {
            logger.error('Error fetching plans:', error.message);
            return [];
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(mobile, gymId, planId) {
        try {
            const response = await axios.post(`${this.baseUrl}/subscribe`, {
                mobile,
                gymId,
                planId
            }, {
                headers: this.getHeaders()
            });
            return response.data.data;
        } catch (error) {
            logger.error('Error creating subscription:', error.response ? error.response.data : error.message);
            return null;
        }
    }

    /**
     * Check active subscription for a user
     */
    async checkSubscription(mobile) {
        try {
            const response = await axios.get(`${this.baseUrl}/subscription`, {
                params: { mobile },
                headers: this.getHeaders()
            });
            return response.data.data;
        } catch (error) {
            logger.error('Error checking subscription:', error.message);
            return null;
        }
    }
}

module.exports = new BackendService();

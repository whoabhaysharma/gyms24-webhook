require('dotenv').config();

module.exports = {
    // WhatsApp Configuration
    whatsapp: {
        verifyToken: process.env.VERIFY_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        token: process.env.API_KEY,
        apiUrl: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    },

    // Backend Configuration
    backend: {
        url: process.env.BACKEND_URL || 'http://localhost:3000/api/whatsapp',
        secret: process.env.BACKEND_SECRET || 'my-secret-key',
        apiKey: process.env.BACKEND_API_KEY,
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
    },

    // Redis Configuration
    redis: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }
};

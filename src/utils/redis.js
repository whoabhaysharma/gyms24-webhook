const { Redis } = require('@upstash/redis');
const config = require('../config');
const logger = require('./logger');

if (!config.redis.url || !config.redis.token) {
    logger.error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined in .env file');
}

const redis = new Redis({
    url: config.redis.url,
    token: config.redis.token,
});

module.exports = redis;

const Redis = require('ioredis');

let redis = null;

if (process.env.NODE_ENV === 'production') {
  redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      });
}

module.exports = redis;

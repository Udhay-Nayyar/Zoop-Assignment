const redisConnection = require("../../src/config/redis");

async function flushTestRedis() {
  await redisConnection.connectRedis();
  await redisConnection.redis.flushdb();
}

async function closeTestRedis() {
  for (const event of ["error", "connect", "ready", "close"]) {
    redisConnection.redis.removeAllListeners(event);
  }
  await redisConnection.closeRedis();
}

module.exports = { flushTestRedis, closeTestRedis };

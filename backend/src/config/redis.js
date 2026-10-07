const Redis = require("ioredis");
const config = require("./env");

const redis = new Redis(config.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  commandTimeout: 500,
  retryStrategy: (times) => Math.min(times * 200, 3000)
});

let lastLoggedState;

function logState(state, level, message) {
  if (lastLoggedState === state) return;
  lastLoggedState = state;
  console[level](message);
}

redis.on("error", () => {
  logState("error", "warn", "Redis connection error.");
});
redis.on("connect", () => {
  logState("connected", "info", "Redis connected.");
});
redis.on("ready", () => {
  logState("ready", "info", "Redis ready.");
});
redis.on("close", () => {
  logState("closed", "info", "Redis connection closed.");
});

async function connectRedis() {
  try {
    if (redis.status === "wait" || redis.status === "end") {
      const connection = redis.connect();
      let timeoutId;
      try {
        await Promise.race([
          connection,
          new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Redis connection timed out")), 1000);
          })
        ]);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    await redis.ping();
  } catch (_error) {
    logState("unavailable", "warn", "Redis unavailable; continuing without cache.");
  }
}

async function closeRedis() {
  if (redis.status === "end") return;

  try {
    await redis.quit();
  } catch (_error) {
    logState("close-error", "warn", "Redis quit failed; disconnecting.");
    redis.disconnect();
  }
}

function isRedisReady() {
  return redis.status === "ready";
}

module.exports = {
  redis,
  connectRedis,
  closeRedis,
  isRedisReady
};

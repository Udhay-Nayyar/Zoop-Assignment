const { redis } = require("../config/redis");
const { listVersionKey } = require("./cacheKeys");

async function getJSON(key) {
  try {
    const value = await redis.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (_error) {
    console.warn(`Cache getJSON failed for key "${key}".`);
    return null;
  }
}

async function setJSON(key, value, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (_error) {
    console.warn(`Cache setJSON failed for key "${key}".`);
  }
}

async function del(...keys) {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (_error) {
    console.warn(`Cache del failed for keys "${keys.join(",")}".`);
  }
}

async function getListVersion() {
  try {
    return (await redis.get(listVersionKey)) || "0";
  } catch (_error) {
    console.warn(`Cache getListVersion failed for key "${listVersionKey}".`);
    return "0";
  }
}

async function bumpListVersion() {
  try {
    await redis.incr(listVersionKey);
  } catch (_error) {
    console.warn(`Cache bumpListVersion failed for key "${listVersionKey}".`);
  }
}

module.exports = {
  getJSON,
  setJSON,
  del,
  getListVersion,
  bumpListVersion
};

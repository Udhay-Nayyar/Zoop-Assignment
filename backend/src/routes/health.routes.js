const express = require("express");
const redisClient = require("../config/redis");

const router = express.Router();

const db = require("../config/db");

router.get("/", async (_req, res) => {
  let databaseUp = false;
  let redisUp = false;

  try {
    await db.query("SELECT 1");
    databaseUp = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  try {
    await redisClient.redis.ping();
    redisUp = true;
  } catch (_error) {
    // Redis is an optimization; a failed health check does not affect API availability.
  }

  const services = {
    database: databaseUp ? "up" : "down",
    redis: redisUp ? "up" : "down"
  };
  const status = databaseUp && redisUp ? "ok" : "degraded";
  res.status(databaseUp ? 200 : 503).json({ status, services });
});

module.exports = router;

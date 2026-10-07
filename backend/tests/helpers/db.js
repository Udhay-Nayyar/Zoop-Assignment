const db = require("../../src/config/db");

async function truncateAgents() {
  await db.query("TRUNCATE TABLE agents RESTART IDENTITY CASCADE");
}

async function closeDb() {
  await db.closeDB();
}

module.exports = { truncateAgents, closeDb };

const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool({ connectionString: config.databaseUrl });

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function connectDB() {
  await query("SELECT 1");
  console.log("Database connection established.");
}

async function closeDB() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  getClient,
  connectDB,
  closeDB
};

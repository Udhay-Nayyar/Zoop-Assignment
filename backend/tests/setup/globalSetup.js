require("./env");

const { Pool } = require("pg");
const config = require("../../src/config/env");

module.exports = async function globalSetup() {
  const databaseUrl = new URL(config.databaseUrl);
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
  databaseUrl.pathname = "/postgres";
  const adminPool = new Pool({ connectionString: databaseUrl.toString() });

  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );
    if (result.rowCount === 0) {
      const escapedDatabaseName = databaseName.replace(/"/g, '""');
      await adminPool.query(`CREATE DATABASE "${escapedDatabaseName}"`);
      console.log(`Created test database: ${databaseName}`);
    }
  } finally {
    await adminPool.end();
  }

  const { runMigrations } = require("../../scripts/migrate");
  const db = require("../../src/config/db");
  try {
    await runMigrations();
  } finally {
    await db.closeDB();
  }
};

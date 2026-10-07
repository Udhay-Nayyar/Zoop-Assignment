const fs = require("node:fs/promises");
const path = require("node:path");
const db = require("../src/config/db");

const migrationsDirectory = path.join(__dirname, "..", "migrations");

async function runMigrations() {
  const client = await db.getClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((filename) => filename.endsWith(".sql"))
      .sort();
    const appliedResult = await client.query("SELECT filename FROM schema_migrations");
    const applied = new Set(appliedResult.rows.map((row) => row.filename));

    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`Skipped migration: ${filename}`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDirectory, filename), "utf8");
      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename]
        );
        await client.query("COMMIT");
        console.log(`Applied migration: ${filename}`);
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error(`Failed to roll back migration ${filename}:`, rollbackError);
        }
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await runMigrations();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await db.closeDB();
    } catch (error) {
      console.error("Failed to close database pool:", error);
      process.exitCode = 1;
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { runMigrations };

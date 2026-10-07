const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

const backendDirectory = path.resolve(__dirname, "../..");
const originalEnvironmentKeys = new Set(Object.keys(process.env));

dotenv.config({ path: path.join(backendDirectory, ".env") });

const testEnvironmentPath = path.join(backendDirectory, ".env.test");
if (fs.existsSync(testEnvironmentPath)) {
  const testEnvironment = dotenv.parse(fs.readFileSync(testEnvironmentPath));
  for (const [key, value] of Object.entries(testEnvironment)) {
    if (!originalEnvironmentKeys.has(key)) process.env[key] = value;
  }
}

let databaseName;
try {
  databaseName = decodeURIComponent(new URL(process.env.DATABASE_URL).pathname.slice(1));
} catch (_error) {
  throw new Error("Test safety guard: DATABASE_URL must be a valid PostgreSQL URL.");
}

if (process.env.NODE_ENV !== "test") {
  throw new Error("Test safety guard: NODE_ENV must be exactly 'test'.");
}
if (!databaseName.endsWith("_test")) {
  throw new Error("Test safety guard: DATABASE_URL database name must end with '_test'.");
}

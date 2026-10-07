const http = require("node:http");
const app = require("./app");
const config = require("./config/env");
const db = require("./config/db");
const redis = require("./config/redis");

let server;
let shuttingDown = false;

async function start() {
  await db.connectDB();
  await redis.connectRedis();

  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, () => {
      server.removeListener("error", reject);
      console.log(`Server listening on port ${config.port}`);
      resolve();
    });
  });

}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down.`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await Promise.all([db.closeDB(), redis.closeRedis()]);
    process.exitCode = 0;
  } catch (error) {
    console.error("Graceful shutdown failed:", error);
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch(async (error) => {
  console.error("Server startup failed:", error);
  await shutdown("startup failure");
  process.exitCode = 1;
});

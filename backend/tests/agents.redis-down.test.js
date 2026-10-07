const request = require("supertest");
const app = require("../src/app");
const redisConnection = require("../src/config/redis");
const useIntegrationLifecycle = require("./helpers/lifecycle");
const { buildAgentPayload, createAgentViaApi } = require("./helpers/factory");

useIntegrationLifecycle();

async function waitFor(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timed out waiting for Redis to become ready.");
}

afterEach(async () => {
  if (redisConnection.redis.status === "end") {
    await redisConnection.connectRedis();
  }
  if (redisConnection.isRedisReady()) {
    await redisConnection.redis.flushdb();
  }
});

describe("API behavior while Redis is unavailable", () => {
  test("serves CRUD and health requests, then resumes cache use after Redis reconnects", async () => {
    const originalAgent = await createAgentViaApi();
    const createdPayload = buildAgentPayload({ fullName: "Redis Down Create" });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    try {
      redisConnection.redis.disconnect();
      await waitFor(() => redisConnection.redis.status === "end");

      const list = await request(app).get("/api/agents");
      const one = await request(app).get(`/api/agents/${originalAgent.id}`);
      const created = await request(app).post("/api/agents").send(createdPayload);
      const updated = await request(app)
        .patch(`/api/agents/${originalAgent.id}`)
        .send({ serviceArea: "Redis Offline Area" });
      const deleted = await request(app).delete(`/api/agents/${created.body.id}`);
      const healthDown = await request(app).get("/health");

      expect(list.status).toBe(200);
      expect(list.headers["x-cache"]).not.toBe("HIT");
      expect(one.status).toBe(200);
      expect(one.headers["x-cache"]).not.toBe("HIT");
      expect(created.status).toBe(201);
      expect(updated.status).toBe(200);
      expect(updated.body.serviceArea).toBe("Redis Offline Area");
      expect(deleted.status).toBe(204);
      expect(healthDown.status).toBe(200);
      expect(healthDown.body).toEqual({
        status: "degraded",
        services: { database: "up", redis: "down" }
      });

      await redisConnection.connectRedis();
      await waitFor(() => redisConnection.isRedisReady());
      await redisConnection.redis.flushdb();

      const firstCachedRead = await request(app).get(`/api/agents/${originalAgent.id}`);
      const secondCachedRead = await request(app).get(`/api/agents/${originalAgent.id}`);
      const healthUp = await request(app).get("/health");

      expect(firstCachedRead.status).toBe(200);
      expect(firstCachedRead.headers["x-cache"]).toBe("MISS");
      expect(firstCachedRead.body.serviceArea).toBe("Redis Offline Area");
      expect(secondCachedRead.headers["x-cache"]).toBe("HIT");
      expect(healthUp.status).toBe(200);
      expect(healthUp.body).toEqual({
        status: "ok",
        services: { database: "up", redis: "up" }
      });
    } finally {
      if (redisConnection.redis.status === "end") {
        await redisConnection.connectRedis();
        await waitFor(() => redisConnection.isRedisReady());
      }
      warn.mockRestore();
    }
  });
});

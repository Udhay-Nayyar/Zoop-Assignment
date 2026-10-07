const request = require("supertest");
const app = require("../src/app");
const config = require("../src/config/env");
const { redis } = require("../src/config/redis");
const { agentKey, listVersionKey } = require("../src/cache/cacheKeys");
const useIntegrationLifecycle = require("./helpers/lifecycle");
const { buildAgentPayload, createAgentViaApi } = require("./helpers/factory");

useIntegrationLifecycle();

describe("agent Redis cache integration", () => {
  test("returns MISS then HIT with identical bodies for an individual agent", async () => {
    const agent = await createAgentViaApi();
    const first = await request(app).get(`/api/agents/${agent.id}`);
    const second = await request(app).get(`/api/agents/${agent.id}`);

    expect(first.status).toBe(200);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.status).toBe(200);
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(second.body).toEqual(first.body);
  });

  test("returns MISS then HIT for an agent list", async () => {
    await createAgentViaApi();
    const first = await request(app).get("/api/agents");
    const second = await request(app).get("/api/agents");

    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(second.body).toEqual(first.body);
  });

  test("normalizes reordered query parameters to the same cached response", async () => {
    await createAgentViaApi({ status: "active" });
    const first = await request(app).get("/api/agents?page=1&status=active");
    const second = await request(app).get("/api/agents?status=active&page=1");

    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
  });

  test("normalizes q casing to the same cached response", async () => {
    await createAgentViaApi({ fullName: "Ravi Search Agent" });
    const first = await request(app).get("/api/agents?q=Ravi");
    const second = await request(app).get("/api/agents?q=ravi");

    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(second.body).toEqual(first.body);
  });

  test("PATCH invalidates the individual record and list with updated values", async () => {
    const agent = await createAgentViaApi({ status: "active" });
    await request(app).get(`/api/agents/${agent.id}`).expect("X-Cache", "MISS");
    await request(app).get("/api/agents").expect("X-Cache", "MISS");

    const updated = await request(app)
      .patch(`/api/agents/${agent.id}`)
      .send({ status: "inactive" });
    const rereadAgent = await request(app).get(`/api/agents/${agent.id}`);
    const rereadList = await request(app).get("/api/agents");

    expect(updated.status).toBe(200);
    expect(updated.headers["x-cache"]).toBeUndefined();
    expect(rereadAgent.headers["x-cache"]).toBe("MISS");
    expect(rereadAgent.body.status).toBe("inactive");
    expect(rereadList.headers["x-cache"]).toBe("MISS");
    expect(rereadList.body.data[0].status).toBe("inactive");
  });

  test("PATCH invalidates every cached list filter and pagination query", async () => {
    const movingAgent = await createAgentViaApi({ status: "active" });
    await createAgentViaApi({ status: "inactive" });
    const queries = [
      "/api/agents",
      "/api/agents?status=active",
      "/api/agents?status=inactive"
    ];

    for (const query of queries) {
      expect((await request(app).get(query)).headers["x-cache"]).toBe("MISS");
    }

    await request(app)
      .patch(`/api/agents/${movingAgent.id}`)
      .send({ status: "inactive" })
      .expect(200);

    const refreshed = await Promise.all(queries.map((query) => request(app).get(query)));
    expect(refreshed.every((response) => response.headers["x-cache"] === "MISS")).toBe(true);
    expect(refreshed[0].body.data.find((agent) => agent.id === movingAgent.id).status)
      .toBe("inactive");
    expect(refreshed[1].body.data.some((agent) => agent.id === movingAgent.id)).toBe(false);
    expect(refreshed[2].body.data.some((agent) => agent.id === movingAgent.id)).toBe(true);
  });

  test("POST invalidates a cached list and makes the new agent visible", async () => {
    await createAgentViaApi();
    await request(app).get("/api/agents").expect("X-Cache", "MISS");
    const payload = buildAgentPayload({ fullName: "New Cache Agent" });
    const created = await request(app).post("/api/agents").send(payload);
    const list = await request(app).get("/api/agents");

    expect(created.status).toBe(201);
    expect(created.headers["x-cache"]).toBeUndefined();
    expect(list.headers["x-cache"]).toBe("MISS");
    expect(list.body.data.some((agent) => agent.id === created.body.id)).toBe(true);
  });

  test("DELETE invalidates the agent key and cached lists", async () => {
    const agent = await createAgentViaApi();
    await request(app).get(`/api/agents/${agent.id}`).expect("X-Cache", "MISS");
    await request(app).get("/api/agents").expect("X-Cache", "MISS");

    const deletion = await request(app).delete(`/api/agents/${agent.id}`);
    const missing = await request(app).get(`/api/agents/${agent.id}`);
    const list = await request(app).get("/api/agents");

    expect(deletion.status).toBe(204);
    expect(deletion.headers["x-cache"]).toBeUndefined();
    expect(missing.status).toBe(404);
    expect(missing.headers["x-cache"]).toBeUndefined();
    expect(list.headers["x-cache"]).toBe("MISS");
    expect(list.body.data).toEqual([]);
  });

  test("does not cache a not-found agent response", async () => {
    const id = "00000000-0000-4000-8000-000000000001";
    const first = await request(app).get(`/api/agents/${id}`);
    const second = await request(app).get(`/api/agents/${id}`);

    expect(first.status).toBe(404);
    expect(second.status).toBe(404);
    expect(await redis.exists(agentKey(id))).toBe(0);
  });

  test("a failed duplicate-email write does not invalidate the cached agent", async () => {
    const first = await createAgentViaApi();
    const second = await createAgentViaApi();
    await request(app).get(`/api/agents/${second.id}`).expect("X-Cache", "MISS");
    const conflict = await request(app)
      .patch(`/api/agents/${second.id}`)
      .send({ email: first.email });
    const reread = await request(app).get(`/api/agents/${second.id}`);

    expect(conflict.status).toBe(409);
    expect(reread.headers["x-cache"]).toBe("HIT");
    expect(reread.body.email).toBe(second.email);
  });

  test("rejects an invalid ID before creating a Redis key", async () => {
    const response = await request(app).get("/api/agents/not-a-uuid");

    expect(response.status).toBe(400);
    expect(await redis.keys("agent:*")).toEqual([]);
  });

  test("sets a bounded TTL on agent entries and no TTL on the list version counter", async () => {
    const agent = await createAgentViaApi();
    await request(app).get(`/api/agents/${agent.id}`).expect(200);
    await request(app).get("/api/agents").expect(200);

    const agentTtl = await redis.ttl(agentKey(agent.id));
    const versionTtl = await redis.ttl(listVersionKey);
    expect(agentTtl).toBeGreaterThan(0);
    expect(agentTtl).toBeLessThanOrEqual(config.cacheTtlAgentSeconds);
    expect(versionTtl).toBe(-1);
  });

  test("does not add X-Cache to POST, PATCH, or DELETE responses", async () => {
    const created = await request(app).post("/api/agents").send(buildAgentPayload());
    const updated = await request(app)
      .patch(`/api/agents/${created.body.id}`)
      .send({ status: "inactive" });
    const deleted = await request(app).delete(`/api/agents/${created.body.id}`);

    expect(created.status).toBe(201);
    expect(updated.status).toBe(200);
    expect(deleted.status).toBe(204);
    expect(created.headers["x-cache"]).toBeUndefined();
    expect(updated.headers["x-cache"]).toBeUndefined();
    expect(deleted.headers["x-cache"]).toBeUndefined();
  });
});

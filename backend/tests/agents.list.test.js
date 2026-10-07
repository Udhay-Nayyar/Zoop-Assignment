const request = require("supertest");
const app = require("../src/app");
const repository = require("../src/repositories/agent.repository");
const useIntegrationLifecycle = require("./helpers/lifecycle");
const { buildAgentPayload } = require("./helpers/factory");
const { expectErrorResponse } = require("./helpers/assertions");

useIntegrationLifecycle();

const fixtures = [
  ["Ravi Name Needle", "name-search@example.test", "+919811000001", "Koramangala", "active"],
  ["Email Search Person", "findme.emailneedle@example.test", "+919811000002", "Indiranagar", "inactive"],
  ["Phone Search Person", "phone-search@example.test", "+919877665544", "Whitefield", "active"],
  ["Area Search Person", "area-search@example.test", "+919811000004", "AreaNeedle Zone", "inactive"],
  ["Percent Agent", "percent@example.test", "+919811000005", "Percent%Area", "active"],
  ["Underscore Agent", "underscore@example.test", "+919811000006", "Under_score Area", "inactive"]
];

async function seedAgents() {
  const agents = [];
  for (const [fullName, email, phone, serviceArea, status] of fixtures) {
    agents.push(await repository.create(buildAgentPayload({
      fullName,
      email,
      phone,
      serviceArea,
      status
    })));
  }

  for (let index = 7; index <= 25; index += 1) {
    agents.push(await repository.create(buildAgentPayload({
      fullName: `Agent ${String(index).padStart(2, "0")}`,
      serviceArea: index % 2 === 0 ? "East District" : "West District",
      status: index % 2 === 0 ? "active" : "inactive"
    })));
  }
  return agents;
}

let agents;

beforeEach(async () => {
  agents = await seedAgents();
});

describe("agent list API", () => {
  test("returns default pagination metadata for 25 agents", async () => {
    const response = await request(app).get("/api/agents");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3
    });
  });

  test("returns a distinct second page with the requested limit", async () => {
    const firstPage = await request(app).get("/api/agents?page=1&limit=5");
    const secondPage = await request(app).get("/api/agents?page=2&limit=5");

    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data).toHaveLength(5);
    expect(secondPage.body.meta).toMatchObject({ page: 2, limit: 5, total: 25 });
    expect(secondPage.body.data.map((agent) => agent.id))
      .not.toEqual(firstPage.body.data.map((agent) => agent.id));
  });

  test("returns an empty page beyond the end with the correct total", async () => {
    const response = await request(app).get("/api/agents?page=999&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta).toEqual({
      page: 999,
      limit: 5,
      total: 25,
      totalPages: 5
    });
  });

  test("filters agents by status", async () => {
    const response = await request(app).get("/api/agents?status=inactive");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.every((agent) => agent.status === "inactive")).toBe(true);
  });

  test("matches service area without regard to case", async () => {
    const response = await request(app).get("/api/agents?serviceArea=areaneedle%20ZONE");

    expect(response.status).toBe(200);
    expect(response.body.data.map((agent) => agent.id)).toEqual([agents[3].id]);
  });

  test("searches full name case-insensitively", async () => {
    const response = await request(app).get("/api/agents?q=rAvI");
    expect(response.body.data.map((agent) => agent.id)).toEqual([agents[0].id]);
  });

  test("searches email", async () => {
    const response = await request(app).get("/api/agents?q=emailneedle");
    expect(response.body.data.map((agent) => agent.id)).toEqual([agents[1].id]);
  });

  test("searches phone", async () => {
    const response = await request(app).get("/api/agents?q=77665544");
    expect(response.body.data.map((agent) => agent.id)).toEqual([agents[2].id]);
  });

  test("searches service area", async () => {
    const response = await request(app).get("/api/agents?q=areaneedle");
    expect(response.body.data.map((agent) => agent.id)).toEqual([agents[3].id]);
  });

  test("treats percent and underscore search characters literally", async () => {
    const percent = await request(app).get("/api/agents").query({ q: "%" });
    const underscore = await request(app).get("/api/agents").query({ q: "_" });

    expect(percent.body.data.map((agent) => agent.id)).toEqual([agents[4].id]);
    expect(underscore.body.data.map((agent) => agent.id)).toEqual([agents[5].id]);
  });

  test("sorts by full name in ascending order", async () => {
    const response = await request(app)
      .get("/api/agents?sortBy=fullName&order=asc&limit=100");
    const names = response.body.data.map((agent) => agent.fullName);

    expect(response.status).toBe(200);
    expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right)));
  });

  test("pages through agents with identical createdAt values without duplicates or gaps", async () => {
    await require("../src/config/db").query(
      "UPDATE agents SET created_at = TIMESTAMPTZ '2025-01-01 00:00:00+00'"
    );

    const allIds = [];
    for (let page = 1; page <= 4; page += 1) {
      const response = await request(app)
        .get(`/api/agents?page=${page}&limit=7&sortBy=createdAt&order=desc`);
      expect(response.status).toBe(200);
      allIds.push(...response.body.data.map((agent) => agent.id));
    }

    expect(allIds).toHaveLength(25);
    expect(new Set(allIds).size).toBe(25);
    expect(new Set(allIds)).toEqual(new Set(agents.map((agent) => agent.id)));
  });

  test.each([
    ["page=0", "/api/agents?page=0"],
    ["limit=1000", "/api/agents?limit=1000"],
    ["status=banana", "/api/agents?status=banana"],
    ["sortBy=password", "/api/agents?sortBy=password"],
    ["an unknown query parameter", "/api/agents?foo=bar"]
  ])("returns 400 for %s", async (_description, url) => {
    const response = await request(app).get(url);
    expectErrorResponse(response, 400);
  });
});

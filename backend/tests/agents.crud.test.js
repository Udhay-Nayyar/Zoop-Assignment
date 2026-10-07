const request = require("supertest");
const app = require("../src/app");
const useIntegrationLifecycle = require("./helpers/lifecycle");
const { buildAgentPayload, createAgentViaApi } = require("./helpers/factory");
const { expectErrorResponse } = require("./helpers/assertions");

useIntegrationLifecycle();

describe("agent CRUD API", () => {
  test("creates an agent with a UUID, active default, normalized email, and timestamps", async () => {
    const payload = buildAgentPayload({ email: "  Agent.Case@Example.Test  " });
    const response = await request(app).post("/api/agents").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
      fullName: payload.fullName,
      phone: payload.phone,
      email: "agent.case@example.test",
      serviceArea: payload.serviceArea,
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  test("returns 400 with details for a missing full name and invalid email", async () => {
    const { fullName: _fullName, ...payload } = buildAgentPayload({ email: "invalid" });
    const response = await request(app).post("/api/agents").send(payload);

    expectErrorResponse(response, 400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(response.body.error.details.map(({ field }) => field)).toEqual(
      expect.arrayContaining(["fullName", "email"])
    );
  });

  test("returns 400 for an invalid phone number", async () => {
    const response = await request(app)
      .post("/api/agents")
      .send(buildAgentPayload({ phone: "not-a-phone" }));

    expectErrorResponse(response, 400);
    expect(response.body.error.details.map(({ field }) => field)).toContain("phone");
  });

  test("returns 409 when email differs only by case", async () => {
    const payload = buildAgentPayload();
    await request(app).post("/api/agents").send(payload).expect(201);
    const response = await request(app).post("/api/agents")
      .send(buildAgentPayload({ email: payload.email.toUpperCase() }));

    expectErrorResponse(response, 409);
    expect(response.body.error.message).toMatch(/email/i);
  });

  test("returns 409 when the phone number is already used", async () => {
    const payload = buildAgentPayload();
    await request(app).post("/api/agents").send(payload).expect(201);
    const response = await request(app).post("/api/agents")
      .send(buildAgentPayload({ phone: payload.phone }));

    expectErrorResponse(response, 409);
    expect(response.body.error.message).toMatch(/phone/i);
  });

  test("returns 400 INVALID_JSON for a malformed request body", async () => {
    const response = await request(app)
      .post("/api/agents")
      .set("Content-Type", "application/json")
      .send('{"fullName":');

    expectErrorResponse(response, 400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });

  test("gets an existing agent by UUID", async () => {
    const agent = await createAgentViaApi();
    const response = await request(app).get(`/api/agents/${agent.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(agent);
  });

  test("returns 404 for an unknown valid UUID", async () => {
    const response = await request(app)
      .get("/api/agents/00000000-0000-4000-8000-000000000001");

    expectErrorResponse(response, 404);
  });

  test("returns 400 for a malformed UUID", async () => {
    const response = await request(app).get("/api/agents/not-a-uuid");
    expectErrorResponse(response, 400);
  });

  test("updates status while preserving creation time and advancing updated time", async () => {
    const agent = await createAgentViaApi();
    const previousCreatedAt = agent.createdAt;
    const previousUpdatedAt = new Date(Date.parse(agent.updatedAt) - 1000).toISOString();

    const { query } = require("../src/config/db");
    await query("UPDATE agents SET updated_at = $1 WHERE id = $2", [
      previousUpdatedAt,
      agent.id
    ]);

    const response = await request(app)
      .patch(`/api/agents/${agent.id}`)
      .send({ status: "inactive" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("inactive");
    expect(response.body.createdAt).toBe(previousCreatedAt);
    expect(Date.parse(response.body.updatedAt)).toBeGreaterThan(Date.parse(previousUpdatedAt));
  });

  test("supports PUT on the agent update route", async () => {
    const agent = await createAgentViaApi();
    const response = await request(app)
      .put(`/api/agents/${agent.id}`)
      .send({ serviceArea: "North District" });

    expect(response.status).toBe(200);
    expect(response.body.serviceArea).toBe("North District");
  });

  test("returns 400 when PATCH has no fields", async () => {
    const agent = await createAgentViaApi();
    const response = await request(app).patch(`/api/agents/${agent.id}`).send({});
    expectErrorResponse(response, 400);
  });

  test("returns 400 when PATCH contains an unknown field", async () => {
    const agent = await createAgentViaApi();
    const response = await request(app)
      .patch(`/api/agents/${agent.id}`)
      .send({ unexpected: true });

    expectErrorResponse(response, 400);
  });

  test("returns 409 when PATCH uses another agent's email", async () => {
    const first = await createAgentViaApi();
    const second = await createAgentViaApi();
    const response = await request(app)
      .patch(`/api/agents/${second.id}`)
      .send({ email: first.email });

    expectErrorResponse(response, 409);
    expect(response.body.error.message).toMatch(/email/i);
  });

  test("returns 404 when PATCH targets an unknown agent", async () => {
    const response = await request(app)
      .patch("/api/agents/00000000-0000-4000-8000-000000000001")
      .send({ status: "inactive" });

    expectErrorResponse(response, 404);
  });

  test("deletes an agent with 204 and subsequent GET returns 404", async () => {
    const agent = await createAgentViaApi();
    const deletion = await request(app).delete(`/api/agents/${agent.id}`);

    expect(deletion.status).toBe(204);
    expect(deletion.text).toBe("");
    expectErrorResponse(await request(app).get(`/api/agents/${agent.id}`), 404);
  });

  test("returns 404 when DELETE targets an unknown agent", async () => {
    const response = await request(app)
      .delete("/api/agents/00000000-0000-4000-8000-000000000001");
    expectErrorResponse(response, 404);
  });

  test("returns the standard error shape for an unknown route", async () => {
    const response = await request(app).get("/api/unknown");
    expectErrorResponse(response, 404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});

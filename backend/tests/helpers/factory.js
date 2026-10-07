const { randomInt, randomUUID } = require("node:crypto");
const request = require("supertest");
const app = require("../../src/app");

function buildAgentPayload(overrides = {}) {
  const unique = randomUUID().replace(/-/g, "");
  return {
    fullName: "Test Delivery Agent",
    phone: `+${randomInt(10000000000000, 99999999999999)}`,
    email: `agent-${unique}@example.test`,
    serviceArea: "Central District",
    ...overrides
  };
}

async function createAgentViaApi(overrides = {}) {
  const response = await request(app)
    .post("/api/agents")
    .send(buildAgentPayload(overrides));
  if (response.status !== 201) {
    throw new Error(`Expected agent creation to return 201, received ${response.status}.`);
  }
  return response.body;
}

module.exports = { buildAgentPayload, createAgentViaApi };

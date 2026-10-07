const request = require("supertest");
const app = require("../src/app");
const useIntegrationLifecycle = require("./helpers/lifecycle");

useIntegrationLifecycle();

describe("health endpoint integration", () => {
  test("returns database and Redis as up when both services are available", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      services: { database: "up", redis: "up" }
    });
  });
});

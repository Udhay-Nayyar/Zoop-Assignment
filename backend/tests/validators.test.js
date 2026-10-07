const {
  createAgentSchema,
  updateAgentSchema,
  listQuerySchema
} = require("../src/validators/agent.validator");
const { buildAgentPayload } = require("./helpers/factory");

describe("agent validation schemas", () => {
  test("normalizes a phone number by removing spaces and dashes", () => {
    const parsed = createAgentSchema.parse(buildAgentPayload({
      phone: "+1 234-567-8901"
    }));
    expect(parsed.phone).toBe("+12345678901");
  });

  test("trims and lowercases email addresses", () => {
    const parsed = createAgentSchema.parse(buildAgentPayload({
      email: "  Mixed.Case@Example.Test  "
    }));
    expect(parsed.email).toBe("mixed.case@example.test");
  });

  test("defaults create status to active", () => {
    expect(createAgentSchema.parse(buildAgentPayload()).status).toBe("active");
  });

  test("requires at least one field in an update", () => {
    expect(updateAgentSchema.safeParse({}).success).toBe(false);
    expect(updateAgentSchema.safeParse({ status: "inactive" }).success).toBe(true);
  });

  test("applies list-query defaults and coerces numeric strings", () => {
    expect(listQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc"
    });
    expect(listQuerySchema.parse({ page: "2", limit: "25" })).toEqual({
      page: 2,
      limit: 25,
      sortBy: "createdAt",
      order: "desc"
    });
  });
});

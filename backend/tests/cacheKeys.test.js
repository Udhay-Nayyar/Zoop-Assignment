const {
  listKey,
  normalizeListQuery
} = require("../src/cache/cacheKeys");

describe("list cache keys", () => {
  test("uses the same key for reordered parameters", () => {
    const first = normalizeListQuery({
      page: 1,
      status: "active",
      limit: 10,
      sortBy: "createdAt",
      order: "desc"
    });
    const second = normalizeListQuery({
      order: "desc",
      limit: 10,
      status: "active",
      sortBy: "createdAt",
      page: 1
    });

    expect(first).toBe(second);
    expect(listKey("3", first)).toBe(
      "agents:list:v3:limit=10&order=desc&page=1&sortBy=createdAt&status=active"
    );
  });

  test("uses different keys for different query values", () => {
    expect(normalizeListQuery({ page: 1 }))
      .not.toBe(normalizeListQuery({ page: 2 }));
    expect(normalizeListQuery({ status: "active" }))
      .not.toBe(normalizeListQuery({ status: "inactive" }));
  });

  test("normalizes q and serviceArea casing", () => {
    expect(normalizeListQuery({ q: "  Ravi " }))
      .toBe(normalizeListQuery({ q: "ravi" }));
    expect(normalizeListQuery({ q: "Ravi" }))
      .toBe(normalizeListQuery({ q: "ravi" }));
    expect(normalizeListQuery({ serviceArea: " Whitefield " }))
      .toBe(normalizeListQuery({ serviceArea: "whitefield" }));
  });

  test("encodes query values and drops empty values", () => {
    expect(normalizeListQuery({ q: "50% _test", status: "" }))
      .toBe("q=50%25%20_test");
  });
});

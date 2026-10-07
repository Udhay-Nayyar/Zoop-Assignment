function expectErrorResponse(response, status) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({
    error: expect.objectContaining({
      code: expect.any(String),
      message: expect.any(String)
    })
  });

  const body = JSON.stringify(response.body);
  expect(body).not.toMatch(/"stack"\s*:|SELECT\s|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM/i);
}

module.exports = { expectErrorResponse };

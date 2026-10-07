const { closeDb, truncateAgents } = require("./db");
const { closeTestRedis, flushTestRedis } = require("./redis");

function useIntegrationLifecycle() {
  let infoLogger;

  beforeAll(() => {
    infoLogger = jest.spyOn(console, "info").mockImplementation(() => {});
  });

  beforeEach(async () => {
    await truncateAgents();
    await flushTestRedis();
  });

  afterAll(async () => {
    try {
      await closeDb();
    } finally {
      try {
        await closeTestRedis();
      } finally {
        infoLogger.mockRestore();
      }
    }
  });
}

module.exports = useIntegrationLifecycle;

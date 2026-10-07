require("dotenv").config();

const { z } = require("zod");

const positiveInteger = z.coerce.number().int().positive();
const schema = z.object({
  PORT: positiveInteger.default(3000),
  DATABASE_URL: z.string().url().default("postgres://postgres:postgres@localhost:5432/delivery_agents"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  CACHE_TTL_AGENT_SECONDS: positiveInteger.default(300),
  CACHE_TTL_LIST_SECONDS: positiveInteger.default(60),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

module.exports = {
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  cacheTtlAgentSeconds: parsed.data.CACHE_TTL_AGENT_SECONDS,
  cacheTtlListSeconds: parsed.data.CACHE_TTL_LIST_SECONDS,
  nodeEnv: parsed.data.NODE_ENV
};


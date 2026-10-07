const repository = require("../repositories/agent.repository");
const AppError = require("../errors/AppError");
const cache = require("../cache/cache");
const { agentKey, listKey, normalizeListQuery } = require("../cache/cacheKeys");
const config = require("../config/env");

function translateDatabaseError(error) {
  if (error.code !== "23505") return error;

  if (error.constraint === "agents_email_lower_key") {
    return AppError.conflict("An agent with this email already exists");
  }
  if (error.constraint === "agents_phone_key") {
    return AppError.conflict("An agent with this phone number already exists");
  }
  return AppError.conflict("An agent with these details already exists");
}

async function createAgent(data) {
  let agent;
  try {
    agent = await repository.create(data);
  } catch (error) {
    throw translateDatabaseError(error);
  }
  await cache.bumpListVersion();
  return agent;
}

async function getAgent(id) {
  const key = agentKey(id);
  const cached = await cache.getJSON(key);
  if (cached !== null) return { data: cached, cache: "HIT" };

  const agent = await repository.findById(id);
  if (!agent) throw AppError.notFound("Agent not found");
  await cache.setJSON(key, agent, config.cacheTtlAgentSeconds);
  return { data: agent, cache: "MISS" };
}

async function listAgents(query = {}) {
  const version = await cache.getListVersion();
  const key = listKey(version, normalizeListQuery(query));
  const cached = await cache.getJSON(key);
  if (cached !== null) return { ...cached, cache: "HIT" };

  const { items, total } = await repository.findAll(query);
  const result = {
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit)
    }
  };
  await cache.setJSON(key, result, config.cacheTtlListSeconds);
  return { ...result, cache: "MISS" };
}

async function updateAgent(id, data) {
  let agent;
  try {
    agent = await repository.update(id, data);
    if (!agent) throw AppError.notFound("Agent not found");
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw translateDatabaseError(error);
  }
  await cache.del(agentKey(id));
  await cache.bumpListVersion();
  return agent;
}

async function deleteAgent(id) {
  const removed = await repository.remove(id);
  if (!removed) throw AppError.notFound("Agent not found");
  await cache.del(agentKey(id));
  await cache.bumpListVersion();
}

module.exports = {
  createAgent,
  getAgent,
  listAgents,
  updateAgent,
  deleteAgent
};

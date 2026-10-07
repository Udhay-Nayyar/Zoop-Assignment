const agentService = require("../services/agent.service");
const asyncHandler = require("../utils/asyncHandler");

const createAgent = asyncHandler(async (req, res) => {
  const agent = await agentService.createAgent(req.body);
  res.status(201).json(agent);
});

const listAgents = asyncHandler(async (req, res) => {
  const { data, meta, cache } = await agentService.listAgents(req.validatedQuery);
  res.set("X-Cache", cache);
  res.status(200).json({ data, meta });
});

const getAgent = asyncHandler(async (req, res) => {
  const { data, cache } = await agentService.getAgent(req.params.id);
  res.set("X-Cache", cache);
  res.status(200).json(data);
});

const updateAgent = asyncHandler(async (req, res) => {
  const agent = await agentService.updateAgent(req.params.id, req.body);
  res.status(200).json(agent);
});

const deleteAgent = asyncHandler(async (req, res) => {
  await agentService.deleteAgent(req.params.id);
  res.status(204).end();
});

module.exports = {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent
};

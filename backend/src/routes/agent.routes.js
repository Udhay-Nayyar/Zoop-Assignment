const express = require("express");
const agentController = require("../controllers/agent.controller");
const validate = require("../middlewares/validate");
const {
  createAgentSchema,
  updateAgentSchema,
  idParamSchema,
  listQuerySchema
} = require("../validators/agent.validator");

const router = express.Router();

router.route("/")
  .post(validate(createAgentSchema, "body"), agentController.createAgent)
  .get(validate(listQuerySchema, "query"), agentController.listAgents);

router.route("/:id")
  .get(validate(idParamSchema, "params"), agentController.getAgent)
  .patch(
    validate(idParamSchema, "params"),
    validate(updateAgentSchema, "body"),
    agentController.updateAgent
  )
  .put(
    validate(idParamSchema, "params"),
    validate(updateAgentSchema, "body"),
    agentController.updateAgent
  )
  .delete(validate(idParamSchema, "params"), agentController.deleteAgent);

module.exports = router;

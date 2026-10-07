const express = require("express");
const agentRoutes = require("./agent.routes");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/api/agents", agentRoutes);

module.exports = router;

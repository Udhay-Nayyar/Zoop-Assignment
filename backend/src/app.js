const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const config = require("./config/env");

const app = express();

app.disable("x-powered-by");

if (config.nodeEnv === "production") {
  app.set("trust proxy", 1);
  app.use(cors({
    origin: (origin, callback) => {
      callback(null, Boolean(origin && config.corsOrigins.includes(origin)));
    }
  }));
} else {
  app.use(cors());
}

app.use(express.json({ limit: "100kb" }));
app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

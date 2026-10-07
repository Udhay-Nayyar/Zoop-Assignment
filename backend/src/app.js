const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(cors());
app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

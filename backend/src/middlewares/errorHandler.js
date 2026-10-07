const AppError = require("../errors/AppError");

module.exports = (error, _req, res, _next) => {
  if (res.headersSent) return;

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON body",
        details: []
      }
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details || []
      }
    });
  }

  console.error(error && error.stack ? error.stack : error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      details: []
    }
  });
};

class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static notFound(message) {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message, details) {
    return new AppError(409, "CONFLICT", message, details);
  }

  static internal(message) {
    return new AppError(500, "INTERNAL_SERVER_ERROR", message);
  }
}

module.exports = AppError;

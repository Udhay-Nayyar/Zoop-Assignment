const AppError = require("../errors/AppError");

function validate(schema, source) {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.flatMap((issue) => {
        if (issue.code === "unrecognized_keys") {
          return issue.keys.map((key) => ({
            field: key,
            message: "Unrecognized field"
          }));
        }
        return [{
          field: issue.path.join(".") || source,
          message: issue.message
        }];
      });
      return next(AppError.badRequest("Validation failed", details));
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      Object.defineProperty(req, source, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: result.data
      });
    }
    return next();
  };
}

module.exports = validate;

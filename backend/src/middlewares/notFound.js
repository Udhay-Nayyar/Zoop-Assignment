const AppError = require("../errors/AppError");

module.exports = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
};

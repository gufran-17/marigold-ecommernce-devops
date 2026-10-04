const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'ValidationError' && err.errors) {
    status = 422;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `A record with this ${field} already exists`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large';
  } else if (err.name === 'MulterError') {
    status = 400;
  }

  const logData = { status, method: req.method, path: req.originalUrl, userId: req.user && req.user.id };
  if (status >= 500) {
    logger.error({ ...logData, err: { message: err.message, stack: err.stack } }, 'Unhandled error');
  } else {
    logger.warn({ ...logData, message }, 'Request failed');
  }

  if (status >= 500 && env.nodeEnv === 'production') message = 'Something went wrong. Please try again later';

  const error = {};
  if (details) error.details = details;
  return res.status(status).json({ success: false, message, error });
}

module.exports = { notFound, errorHandler };

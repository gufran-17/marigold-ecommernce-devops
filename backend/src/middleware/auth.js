const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../config/logger');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Requires a valid Bearer token. Attaches req.user.
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('Please log in to continue');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    logger.warn({ ip: req.ip, reason: err.name }, 'Authentication failed: invalid token');
    throw ApiError.unauthorized('Session expired or invalid. Please log in again');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    logger.warn({ ip: req.ip }, 'Authentication failed: user missing or disabled');
    throw ApiError.unauthorized('Account not available');
  }
  req.user = user;
  next();
});

// Role check. Use after protect.
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    logger.warn({ userId: req.user && req.user.id, path: req.originalUrl }, 'Authorization denied');
    return next(ApiError.forbidden('You do not have permission to access this resource'));
  }
  return next();
};

module.exports = { protect, authorize };

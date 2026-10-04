const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max: env.nodeEnv === 'test' ? 10000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, message, error: {} }),
  });

module.exports = {
  apiLimiter: make(15 * 60 * 1000, 600, 'Too many requests. Please slow down'),
  authLimiter: make(15 * 60 * 1000, 30, 'Too many login attempts. Try again in a few minutes'),
};

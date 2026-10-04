const pino = require('pino');
const env = require('./env');

// JSON logs on stdout. Easy to collect with ELK / CloudWatch later.
const logger = pino({
  level: env.nodeEnv === 'test' && !process.env.TEST_LOGS ? 'silent' : env.logLevel,
  base: { service: 'ecommerce-backend', env: env.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
  // Never write secrets to logs
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'newPassword',
      'currentPassword',
      'token',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});

module.exports = logger;

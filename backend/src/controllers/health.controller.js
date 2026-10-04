const { dbState } = require('../config/db');

// Public, no sensitive data. Returns 503 when the database is not connected.
exports.health = (_req, res) => {
  const database = dbState();
  const healthy = database === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    service: 'ecommerce-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database,
  });
};

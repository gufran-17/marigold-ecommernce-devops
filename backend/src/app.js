const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { health } = require('./controllers/health.controller');
const { notFound, errorHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimit');
const sanitize = require('./middleware/sanitize');
const { uploadRoot } = require('./services/imageStorage.service');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = env.clientUrl.split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/health' },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);

app.get('/health', health);
app.use('/uploads', express.static(uploadRoot, { maxAge: '7d' }));
app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

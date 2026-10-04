const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

async function connectDB(uri = env.mongoUri) {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err: err.message }, 'MongoDB error'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

async function disconnectDB() {
  await mongoose.disconnect();
}

function dbState() {
  const map = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return map[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, disconnectDB, dbState };

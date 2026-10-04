require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

function loadEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    logLevel: process.env.LOG_LEVEL || 'info',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    publicUrl: process.env.PUBLIC_URL || '',
    shippingFee: Number(process.env.SHIPPING_FEE || 49),
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD || 999),
    seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
  };
}

module.exports = loadEnv();

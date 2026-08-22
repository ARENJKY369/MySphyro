const path = require('path');
const root = path.resolve(__dirname, '../..');
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: number(process.env.API_PORT, 3000),
  databasePath: path.resolve(root, process.env.DATABASE_PATH || './data/mysphyro.db'),
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me-before-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || './uploads'),
  maxFileSize: number(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)
};
if (env.nodeEnv === 'production' && env.jwtSecret === 'development-only-change-me-before-production') {
  throw new Error('JWT_SECRET must be configured in production');
}
module.exports = env;

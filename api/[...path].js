// Vercel serverless entry point. Express handles /api/v1/* and /health requests.
module.exports = require('../backend/src/app');

require('dotenv').config();
const env = require('./src/config/env');
const app = require('./src/app');
const server = app.listen(env.port, '0.0.0.0', () => console.log(`MySphyro API listening on http://0.0.0.0:${env.port}`));
function shutdown(signal) { console.log(`${signal} received; shutting down`); server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000).unref(); }
process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));

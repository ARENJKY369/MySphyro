const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils/errors');
function authenticate(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new ApiError(401, 'Authentication is required'));
  try { req.user = jwt.verify(token, env.jwtSecret); return next(); } catch { return next(new ApiError(401, 'Invalid or expired access token')); }
}
module.exports = { authenticate };

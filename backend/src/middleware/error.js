const { ApiError } = require('../utils/errors');
function notFound(req, res, next) { next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`)); }
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err instanceof ApiError ? err.status : err instanceof SyntaxError && 'body' in err ? 400 : 500;
  if (status >= 500) console.error(`[${req.id || 'request'}]`, err);
  res.status(status).json({ success: false, error: { message: status >= 500 ? 'Internal server error' : status === 400 && err instanceof SyntaxError ? 'Malformed JSON request body' : err.message, ...(err.details ? { details: err.details } : {}), requestId: req.id } });
}
module.exports = { notFound, errorHandler };

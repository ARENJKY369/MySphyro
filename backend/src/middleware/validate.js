const { ApiError } = require('../utils/errors');
function object(body) { if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Request body must be a JSON object'); }
function text(value, field, { required = true, max = 500 } = {}) { if (required && (!value || typeof value !== 'string' || !value.trim())) throw new ApiError(400, `${field} is required`); if (value !== undefined && (typeof value !== 'string' || value.trim().length > max)) throw new ApiError(400, `${field} must be a string of at most ${max} characters`); return value?.trim(); }
function integer(value, field) { const id = Number(value); if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(400, `${field} must be a positive integer`); return id; }
function pagination(query) { const page = Math.max(1, Number.parseInt(query.page, 10) || 1); const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20)); return { page, limit, offset: (page - 1) * limit }; }
module.exports = { object, text, integer, pagination };

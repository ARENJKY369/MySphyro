const { ApiError } = require('../utils/errors');
const schemas = {
  tasks: { required: ['title'], fields: { title: 200, due: 100, priority: 10, category: 80 }, enums: { priority: ['high', 'med', 'low'] }, booleans: ['done'] },
  documents: { required: ['name'], fields: { name: 255, type: 20, size: 30, tag: 80, date: 100, important: 300, url: 500 }, booleans: [] },
  expenses: { required: ['name', 'amount'], fields: { name: 200, category: 80, date: 100 }, numbers: ['amount'], booleans: [] },
  plans: { required: ['title'], fields: { title: 200, tag: 80, desc: 1000, meta: 200 }, numbers: ['progress'], booleans: [] },
  personal: { required: ['name'], fields: { name: 200, note: 500 }, booleans: ['done'] },
  classes: { required: ['title'], fields: { title: 200, time: 80, room: 200 }, booleans: [] },
  activities: { required: ['title'], fields: { icon: 20, title: 200, meta: 500 }, booleans: [] }
};
function validateResource(type, value) {
  const schema = schemas[type]; if (!schema) throw new ApiError(404, 'Unknown resource type'); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(400, 'data must be an object');
  const clean = {};
  for (const key of schema.required) if (typeof value[key] !== 'string' && typeof value[key] !== 'number') throw new ApiError(400, `${key} is required`);
  for (const [key, max] of Object.entries(schema.fields)) if (value[key] !== undefined) { if (typeof value[key] !== 'string' || value[key].trim().length > max) throw new ApiError(400, `${key} must be text of at most ${max} characters`); clean[key] = value[key].trim(); }
  for (const key of schema.numbers || []) if (value[key] !== undefined) { if (!Number.isFinite(value[key]) || value[key] < 0 || (key === 'progress' && value[key] > 100)) throw new ApiError(400, `${key} must be a valid non-negative number`); clean[key] = value[key]; }
  for (const key of schema.booleans) if (value[key] !== undefined) { if (typeof value[key] !== 'boolean') throw new ApiError(400, `${key} must be true or false`); clean[key] = value[key]; }
  for (const [key, allowed] of Object.entries(schema.enums || {})) if (clean[key] !== undefined && !allowed.includes(clean[key])) throw new ApiError(400, `${key} is invalid`);
  return clean;
}
module.exports = { validateResource };

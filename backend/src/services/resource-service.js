const db = require('../db/database');
const { ApiError } = require('../utils/errors');
const TYPES = ['tasks', 'documents', 'expenses', 'plans', 'personal', 'classes', 'activities'];
function assertType(type) { if (!TYPES.includes(type)) throw new ApiError(404, 'Unknown resource type'); }
function parse(row) { return row && { id: row.id, ...JSON.parse(row.data), createdAt: row.created_at, updatedAt: row.updated_at }; }
function get(userId, type, id) { assertType(type); const row = db.prepare('SELECT * FROM resources WHERE user_id = ? AND type = ? AND id = ?').get(userId, type, id); if (!row) throw new ApiError(404, 'Resource not found'); return parse(row); }
function list(userId, type, { search, limit, offset }) { assertType(type); let sql = 'FROM resources WHERE user_id = ? AND type = ?'; const values = [userId, type]; if (search) { sql += ' AND lower(data) LIKE ? ESCAPE \'\\\''; values.push(`%${search.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`); } const total = db.prepare(`SELECT count(*) AS count ${sql}`).get(...values).count; const rows = db.prepare(`SELECT * ${sql} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`).all(...values, limit, offset).map(parse); return { rows, total }; }
function create(userId, type, data) { assertType(type); const result = db.prepare('INSERT INTO resources (user_id, type, data) VALUES (?, ?, ?)').run(userId, type, JSON.stringify(data)); return get(userId, type, Number(result.lastInsertRowid)); }
function update(userId, type, id, data) { get(userId, type, id); db.prepare("UPDATE resources SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND type = ? AND id = ?").run(JSON.stringify(data), userId, type, id); return get(userId, type, id); }
function remove(userId, type, id) { get(userId, type, id); db.prepare('DELETE FROM resources WHERE user_id = ? AND type = ? AND id = ?').run(userId, type, id); }
module.exports = { TYPES, list, create, get, update, remove };

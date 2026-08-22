const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const env = require('../config/env');
const { ApiError } = require('../utils/errors');
const { object, text } = require('../middleware/validate');
const { send } = require('../utils/response');
const userDto = user => ({ id: user.id, name: user.name, email: user.email, createdAt: user.created_at });
const issueToken = user => jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
async function register(req, res) { object(req.body); const name = text(req.body.name, 'name', { max: 100 }); const email = text(req.body.email, 'email', { max: 254 }).toLowerCase(); const password = text(req.body.password, 'password', { max: 128 }); if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'email must be valid'); if (password.length < 8) throw new ApiError(400, 'password must be at least 8 characters'); if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) throw new ApiError(409, 'An account with this email already exists'); const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, await bcrypt.hash(password, 12)); const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid); return send(res, 201, { user: userDto(user), token: issueToken(user) }); }
async function login(req, res) { object(req.body); const email = text(req.body.email, 'email', { max: 254 }).toLowerCase(); const password = text(req.body.password, 'password', { max: 128 }); const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email); if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new ApiError(401, 'Invalid email or password'); return send(res, 200, { user: userDto(user), token: issueToken(user) }); }
function me(req, res) { const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub); if (!user) throw new ApiError(401, 'Account no longer exists'); return send(res, 200, { user: userDto(user) }); }
module.exports = { register, login, me };

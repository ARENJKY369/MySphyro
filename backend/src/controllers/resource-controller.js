const resources = require('../services/resource-service'); const { object, integer, pagination } = require('../middleware/validate'); const { validateResource } = require('../validators/resource-validator'); const { send } = require('../utils/response');
function list(req, res) { const { page, limit, offset } = pagination(req.query); const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : ''; const result = resources.list(req.user.sub, req.params.type, { search, page, limit, offset }); return send(res, 200, result.rows, { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) }); }
function create(req, res) { object(req.body); return send(res, 201, resources.create(req.user.sub, req.params.type, validateResource(req.params.type, req.body.data))); }
function get(req, res) { return send(res, 200, resources.get(req.user.sub, req.params.type, integer(req.params.id, 'id'))); }
function update(req, res) { object(req.body); return send(res, 200, resources.update(req.user.sub, req.params.type, integer(req.params.id, 'id'), validateResource(req.params.type, req.body.data))); }
function remove(req, res) { resources.remove(req.user.sub, req.params.type, integer(req.params.id, 'id')); return res.status(204).send(); }
module.exports = { list, create, get, update, remove };

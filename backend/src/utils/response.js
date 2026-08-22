function send(res, status, data, meta) { return res.status(status).json({ success: status < 400, data, ...(meta ? { meta } : {}) }); }
module.exports = { send };

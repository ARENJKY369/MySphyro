// backend/routes/api.js
const express = require('express');
const router = express.Router();
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

router.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  // Process message and call GitHub APIs if needed
  res.json({ reply: 'Response from backend' });
});

module.exports = router;

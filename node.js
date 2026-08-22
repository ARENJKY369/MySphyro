// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Your backend routes here
app.listen(3000, () => console.log('Backend running on port 3000'));

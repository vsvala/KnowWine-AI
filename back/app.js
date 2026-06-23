const express = require('express');
const cors = require('cors');
const path = require('path');
const mywinesRouter = require('./controllers/mywines');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const dotenv = require('dotenv');
const wines = require('./wines.json');

const { unknownEndpoint, errorHandler, rateLimiter } = require('./utils/middleware');

const app = express();
// If this app runs behind a proxy (Render, Heroku, etc.), trust proxy headers
app.set('trust proxy', true);
app.use(cors());

const BASE_URL = process.env.GRAPEMINDS_URL;
console.log('url', process.env.GRAPEMINDS_URL);

dotenv.config.app; // Request size limit (prevent large payloads that consume memory)
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/mywines', mywinesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.get('/api/wines', async (req, res) => {
  // try {
  //   const response = await fetch(`${BASE_URL}/wines?per_page=100&page=1`, {
  //     headers: {
  //       Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}`,
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error(`HTTP error: ${response.status}`);
  //   }
  try {
    console.log(wines.data);

    // const wines = await response.json();
    res.json(wines.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  console.log('Serving index.html from backend:', path.join(__dirname, 'dist', 'index.html'));
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;

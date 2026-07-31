const express = require('express');
const cors = require('cors');
const path = require('path');
const mywinesRouter = require('./controllers/mywines');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const dotenv = require('dotenv');
const wines = require('./wines.json');
const redis = require('./utils/redis');
const WINES_CACHE_KEY = 'grapeminds:wines';
const CACHE_TTL = 5184000; // 2kk minuuttia sekunteina
const helmet = require('helmet');

const {
  unknownEndpoint,
  errorHandler,
  rateLimiter,
  loginRateLimiter,
} = require('./utils/middleware');

const app = express();
// If this app runs behind a proxy (Render, Heroku, etc.), trust proxy headers
app.set('trust proxy', true);
//app.use(cors());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://knowwine-ai.onrender.com'
        : 'http://localhost:5173',
  })
);
app.use(helmet());

const BASE_URL = process.env.GRAPEMINDS_URL;
console.log('url', process.env.GRAPEMINDS_URL);

dotenv.config.app; // Request size limit (prevent large payloads that consume memory)
app.use(express.json({ limit: '1mb' }));

app.use(rateLimiter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  // app.use(express.static(path.join(__dirname, '../front/dist')))
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    console.log('Serving index.html from backend:', path.join(__dirname, 'dist', 'index.html'));
    //app.get('/*splat', (req, res) => {
    // res.sendFile(path.join(__dirname, '../front/dist/index.html'))
  });
}

app.use('/api/mywines', mywinesRouter);
app.use('/api/users', usersRouter);
//app.use('/api/login', loginRouter);
app.use('/api/login', loginRateLimiter, loginRouter);

app.get('/api/wines', async (req, res) => {
  // dev ad test: use local json-file
  if (process.env.NODE_ENV !== 'production') {
    return res.json(wines.data);
  }
  //  // production: Redis cache → GRAPEMINDS API
  try {
    // 1.check cache first
    const cached = await redis.get(WINES_CACHE_KEY);
    if (cached) {
      console.log('wines from cache');
      return res.json(JSON.parse(cached));
    }
    // // 2. empty Cache t → call API
    const response = await fetch(`${BASE_URL}/wines?per_page=100&page=1`, {
      headers: {
        Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    // try {

    const wines = await response.json();

    console.log(wines.data);
    // 3. save Redis TTL
    await redis.set(WINES_CACHE_KEY, JSON.stringify(wines.data), 'EX', CACHE_TTL);

    res.json(wines.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/health', (req, res) => {
  res.send('ok');
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;

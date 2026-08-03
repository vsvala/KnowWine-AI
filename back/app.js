const express = require('express');
const cors = require('cors');
const path = require('path');
const mywinesRouter = require('./controllers/mywines');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const winesRouter = require('./controllers/wines');
const dotenv = require('dotenv');
const helmet = require('helmet');
const {
  unknownEndpoint,
  errorHandler,
  rateLimiter,
  loginRateLimiter,
} = require('./utils/middleware');

const app = express();
// Trust exactly one hop (Render's edge proxy) so req.ip is the address Render
// appended to X-Forwarded-For, not an attacker-controlled value further left
// in the chain. `true` would trust the whole chain, letting clients spoof
// req.ip on every request and bypass IP-keyed rate limiting entirely.
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
//app.use(cors());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://knowwine-ai.onrender.com'
        : 'http://localhost:5173', //dev
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // maplibre-gl runs its tile/glyph parsing in a worker created from a
        // blob: URL, which the default script-src fallback doesn't allow.
        workerSrc: ["'self'", 'blob:'], // eslint-disable-line @stylistic/js/quotes -- literal quotes required by CSP
        // Home.tsx loads the demo style/tiles/glyphs straight from
        // demotiles.maplibre.org; default-src 'self' otherwise blocks the fetch.
        connectSrc: ["'self'", 'https://demotiles.maplibre.org'], // eslint-disable-line @stylistic/js/quotes -- literal quotes required by CSP
      },
    },
  })
);

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
app.use('/api/login', loginRateLimiter, loginRouter);
app.use('/api/wines', winesRouter);

app.get('/health', (req, res) => {
  res.send('ok');
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;

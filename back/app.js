const express = require('express');
const cors = require('cors');
const path = require('path');
const mywinesRouter = require('./controllers/mywines');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const { unknownEndpoint, errorHandler, rateLimiter } = require('./utils/middleware');

const app = express();
// If this app runs behind a proxy (Render, Heroku, etc.), trust proxy headers
app.set('trust proxy', true);
app.use(cors());

// Request size limit (prevent large payloads that consume memory)
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/mywines', mywinesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  console.log('Serving index.html from backend:', path.join(__dirname, 'dist', 'index.html'));
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;

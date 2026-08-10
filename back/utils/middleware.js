const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
};
// Express only recognizes this as error-handling middleware if it has 4 params,
// so `_next` must stay even though it's unused in the body.
const errorHandler = (error, req, res, _next) => {
  console.error(error.message);

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'token invalid' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  }
  res.status(500).json({ error: 'Internal server error' });
};

// Simple rate limiter (max 50 req/15min in production, 500 in development)
const requestCounts = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = process.env.NODE_ENV === 'production' ? 50 : 500;

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 0, reset: now + RATE_LIMIT_WINDOW };
  }

  if (now > requestCounts[ip].reset) {
    requestCounts[ip] = { count: 0, reset: now + RATE_LIMIT_WINDOW };
  }

  requestCounts[ip].count++;

  if (requestCounts[ip].count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  next();
};

// Stricter limiter specifically for login attempts (brute-force protection)
const loginAttemptCounts = {};
const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOGIN_RATE_LIMIT_MAX = process.env.NODE_ENV === 'production' ? 8 : 500;

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!loginAttemptCounts[ip] || now > loginAttemptCounts[ip].reset) {
    loginAttemptCounts[ip] = { count: 0, reset: now + LOGIN_RATE_LIMIT_WINDOW };
  }

  loginAttemptCounts[ip].count++;

  if (loginAttemptCounts[ip].count > LOGIN_RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }

  next();
};

// Clean up old rate limit entries every 30 minutes
// .unref() so this timer doesn't prevent the process from exiting (e.g. in tests)
setInterval(
  () => {
    const now = Date.now();
    for (const ip in requestCounts) {
      if (requestCounts[ip].reset < now) {
        delete requestCounts[ip];
      }
    }
    for (const ip in loginAttemptCounts) {
      if (loginAttemptCounts[ip].reset < now) {
        delete loginAttemptCounts[ip];
      }
    }
  },
  30 * 60 * 1000
).unref();

module.exports = { unknownEndpoint, errorHandler, rateLimiter, loginRateLimiter };

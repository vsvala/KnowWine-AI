const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, _next) => {
  console.error(error.message);

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (error.code === '23505') {
    return res.status(400).json({ error: 'name must be unique' });
  }

  res.status(500).json({ error: 'Internal server error' });
};
// Simple rate limiter (max 50 requests per 15 minutes per IP)
const requestCounts = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 50;

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

// Clean up old rate limit entries every 30 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const ip in requestCounts) {
      if (requestCounts[ip].reset < now) {
        delete requestCounts[ip];
      }
    }
  },
  30 * 60 * 1000
);

module.exports = { unknownEndpoint, errorHandler, rateLimiter };

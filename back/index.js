// index.js startig server
const app = require('./app');
const { PORT } = require('./utils/config');
const { connectToDatabase } = require('./utils/db');

const start = async () => {
  const missing = [];
  if (!process.env.SECRET) missing.push('SECRET');
  if (!process.env.REFRESH_TOKEN_SECRET) missing.push('REFRESH_TOKEN_SECRET');
  if (missing.length) throw new Error(`Missing required env var(s): ${missing.join(', ')}`);

  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        'Protections active: Rate limiting (50 req/15min), Input validation, Request size limit (1MB)'
      );
    });
  } catch (err) {
    console.error('Failed to start application - DB connection error:', err);
    process.exit(1);
  }
};

start();

// index.js startig server
const app = require('./app');
const { PORT } = require('./utils/config');
const { connectToDatabase } = require('./utils/db');

const start = async () => {
  if (!process.env.SECRET) throw new Error('SECRET environment variable is required');

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

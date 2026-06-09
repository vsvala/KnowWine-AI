const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl:
    process.env.DB_SSL === 'true' && process.env.NODE_ENV !== 'test'
      ? { rejectUnauthorized: false }
      : false,
});
//DB_SSL disabled for NODE_ENV=test — Docker Postgres doesn't use SSL

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS my_wines (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK (LENGTH(name) >= 2),
      description TEXT NOT NULL CHECK (LENGTH(description) >= 5),
      Date TIME
    )
  `);
};

//ALTER TABLE my_wines ADD CONSTRAINT name_min_length CHECK (LENGTH(name) >= 2);
//
/**
 * Establish a connection and ensure schema exists.
 * Throws on failure so callers can decide how to proceed.
 */
const connectToDatabase = async () => {
  // simple check that the pool can connect
  await pool.query('SELECT 1');
  await initDb();
  console.log('Database connected and initialized');
};

module.exports = { pool, connectToDatabase, config };

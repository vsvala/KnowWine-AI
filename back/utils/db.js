const { DATABASE_URL } = require('./config');
const { Pool } = require('pg');

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'knowwine',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(dbConfig);

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

module.exports = { pool, connectToDatabase, dbConfig };

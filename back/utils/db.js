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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (LENGTH(name) >= 2),
      username TEXT NOT NULL UNIQUE CHECK (LENGTH(username) >= 2),
      password_hash TEXT NOT NULL,
      date TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS my_wines (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (LENGTH(name) >= 2),
      description TEXT NOT NULL CHECK (LENGTH(description) >= 5),
      user_id INTEGER REFERENCES users(id),
      date TIMESTAMP
    );
    ALTER TABLE my_wines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
  `);
};

// const addUser = async () => {
//   await pool.query(`
//         INSERT INTO users(name, username, password_hash) VALUES ('Mina','Mina','test') RETURNING id, name, username
//       `);
// };

//ALTER TABLE my_wines ADD CONSTRAINT name_min_length CHECK (LENGTH(name) >= 2);
// DROP TABLE IF EXISTS my_wines;
/**
 * Establish a connection and ensure schema exists.
 * Throws on failure so callers can decide how to proceed.
 */

/* \l          -- databases
\c myapp    -- connect database
\dt         -- tables
\d users    -- table structure
SELECT * FROM users; */

const connectToDatabase = async () => {
  // simple check that the pool can connect
  await pool.query('SELECT 1');
  await initDb();
  //await addUser();
  console.log('Database connected and initialized');
};

module.exports = { pool, connectToDatabase, config };

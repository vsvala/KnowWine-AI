const { pool } = require('../utils/db');

const getAll = async () => {
  const result = await pool.query('SELECT id, name, username FROM users ORDER BY id');
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query('SELECT id, name, username FROM users WHERE id = $1', [id]);
  return result.rows;
};

const deleteById = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

const create = async (name, username, password_hash) => {
  const result = await pool.query(
    'INSERT INTO users(name, username, password_hash) VALUES ($1, $2, $3) RETURNING id, name, username',
    [name.trim(), username.trim(), password_hash]
  );
  return result.rows[0];
};

module.exports = { getAll, getById, deleteById, create };

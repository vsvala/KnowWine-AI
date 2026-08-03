const { pool } = require('../utils/db');

const getAll = async (userId) => {
  const result = await pool.query(
    'SELECT id, name, description, user_id FROM my_wines WHERE user_id = $1 ORDER BY id',
    [userId]
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, description, user_id FROM my_wines WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const create = async ({ name, description, userId }) => {
  const result = await pool.query(
    'INSERT INTO my_wines(name, description, user_id) VALUES ($1, $2, $3) RETURNING id, name, description, user_id',
    [name.trim(), description.trim(), userId]
  );
  return result.rows[0];
};

const deleteById = async (id) => {
  await pool.query('DELETE FROM my_wines WHERE id = $1', [id]);
};

module.exports = { getAll, getById, create, deleteById };

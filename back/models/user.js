const { pool } = require('../utils/db');

// const getAll = async () => {
//   const result = await pool.query('SELECT id, name, username FROM users ORDER BY id');
//   return result.rows;
// };
const getAll = async () => {
  const result = await pool.query(`
    SELECT
      users.id,
      users.name,
      users.username,
      users.role,
      json_agg(
        json_build_object('id', my_wines.id, 'name', my_wines.name, 'description', my_wines.description)
      ) FILTER (WHERE my_wines.id IS NOT NULL) AS wines
    FROM users
    LEFT JOIN my_wines ON my_wines.user_id = users.id
    GROUP BY users.id
    ORDER BY users.id
  `);
  return result.rows;
};
//LEFT JOIN my_wines ON my_wines.user_id = users.id — joins wines to each user (LEFT JOIN means users with no wines are still included)
//json_build_object(...) — shapes each wine row into a {id, name, description} object
//json_agg(...) — aggregates all wine objects for a user into an array
//FILTER (WHERE my_wines.id IS NOT NULL) — returns [] instead of [null] for users with no wines
//GROUP BY users.id — required whenever you use an aggregate function like json_agg

const getByUsername = async (username) => {
  const result = await pool.query(
    'SELECT id, name, username, password_hash, role FROM users WHERE username = $1',
    [username]
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query('SELECT id, name, username, role FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const deleteById = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

const setRole = async (id, role) => {
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
};

const create = async (name, username, password_hash, role) => {
  if (typeof role === 'string') {
    const result = await pool.query(
      'INSERT INTO users(name, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, username, role',
      [name.trim(), username.trim(), password_hash, role]
    );
    return result.rows[0];
  }
  // let DB apply default role
  const result = await pool.query(
    'INSERT INTO users(name, username, password_hash) VALUES ($1, $2, $3) RETURNING id, name, username, role',
    [name.trim(), username.trim(), password_hash]
  );
  return result.rows[0];
};

module.exports = { getAll, getById, deleteById, create, getByUsername, setRole };

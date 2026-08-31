const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');

const passwordHash = bcrypt.hashSync('sekret', 10);

const initialWines = [
  { name: 'Barolo', description: 'A bold Italian red wine from Piedmont' },
  { name: 'Chablis', description: 'A crisp French white wine from Burgundy' },
];

const winesInDb = async () => {
  const result = await pool.query(
    'SELECT id, name, description, user_id FROM my_wines ORDER BY id'
  );
  return result.rows;
};

const initialUsers = [
  { name: 'Pekka', username: 'Peke', role: 'member', password_hash: passwordHash },
  { name: 'Jaska', username: 'Joku', role: 'member', password_hash: passwordHash },
];

// Admin-gated routes (GET /api/users, DELETE /api/users/:id, POST
// /api/users/:id/role) need a caller with role='admin' — kept separate from
// initialUsers since most tests want ordinary members seeded by default.
const initialAdmin = {
  name: 'Admin',
  username: 'AdminUser',
  role: 'admin',
  password_hash: passwordHash,
};

const usersInDb = async () => {
  const result = await pool.query('SELECT id, name, username, role FROM users ORDER BY id');
  return result.rows;
};

module.exports = { initialWines, winesInDb, initialUsers, initialAdmin, usersInDb };

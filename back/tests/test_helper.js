const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');

const passwordHash = bcrypt.hashSync('sekret', 10);

const initialWines = [
  { name: 'Barolo', description: 'A bold Italian red wine from Piedmont' },
  { name: 'Chablis', description: 'A crisp French white wine from Burgundy' },
];

const winesInDb = async () => {
  const result = await pool.query('SELECT id, name, description, user_id FROM my_wines ORDER BY id');
  return result.rows;
};

const initialUsers = [
  { name: 'Pekka', username: 'Peke', password_hash: passwordHash },
  { name: 'Jaska', username: 'Joku', password_hash: passwordHash },
];

const usersInDb = async () => {
  const result = await pool.query('SELECT id, name, username FROM users ORDER BY id');
  return result.rows;
};
//(`INSERT INTO users(name, username, password_hash) VALUES ('Mina','Mina','test') RETURNING id, name, username

module.exports = { initialWines, winesInDb, initialUsers, usersInDb };

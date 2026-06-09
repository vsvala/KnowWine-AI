const { pool } = require('../utils/db');

const initialWines = [
  { name: 'Barolo', description: 'A bold Italian red wine from Piedmont' },
  { name: 'Chablis', description: 'A crisp French white wine from Burgundy' },
];

const winesInDb = async () => {
  const result = await pool.query('SELECT id, name, description FROM my_wines ORDER BY id');
  return result.rows;
};

module.exports = { initialWines, winesInDb };

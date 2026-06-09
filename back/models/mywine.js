const { pool } = require('../utils/db')

const getAll = async () => {
  const result = await pool.query('SELECT id, name, description FROM my_wines ORDER BY id')
  return result.rows
}

const getById = async (id) => {
  const result =  await pool.query(
      'SELECT id, name, description FROM my_wines WHERE id = $1',
      [id])
  return result.rows[0]
}

const create = async ({ name, description }) => {
  const result =  await pool.query(
   'INSERT INTO my_wines(name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name.trim(), description.trim()]
    )
  return result.rows[0]
}

const deleteById = async (id) => {
  await pool.query('DELETE FROM my_wines WHERE id = $1', [id])
}

module.exports = { getAll, getById, create, deleteById }
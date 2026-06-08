const router = require('express').Router()
const { pool } = require('../util/db')


// Input validation helpers
const validateName = (name) => {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100
}

const validateDescription = (desc) => {
  return typeof desc === 'string' && desc.trim().length > 0 && desc.trim().length <= 1000
}

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM my_wines ORDER BY id'
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    const result = await pool.query(
      'SELECT id, name, description FROM my_wines WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!validateName(name)) {
      return res.status(400).json({ error: 'name must be a non-empty string (max 100 chars)' })
    }
    if (!validateDescription(description)) {
      return res.status(400).json({ error: 'description must be a non-empty string (max 1000 chars)' })
    }

    const result = await pool.query(
      'INSERT INTO my_wines(name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name.trim(), description.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'name must be unique' })
    }
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    const result = await pool.query(
      'DELETE FROM my_wines WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router
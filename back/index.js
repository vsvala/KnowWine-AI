require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { Pool } = require('pg')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

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
    }

const pool = new Pool(dbConfig)

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS my_wines (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      Date TIME
    )
  `)
}

initDb().catch(error => {
  console.error('Database initialization error:', error)
  process.exit(1)
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  console.log('Serving index.html from backend:', path.join(__dirname, 'dist', 'index.html'))
})


app.get('/api/data', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM my_wines ORDER BY id'
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

app.get('/api/data/:id', async(req, res, next) => {
  try{
    const result=await pool.query('SELECT id, name, description FROM my_wines WHERE id = $1', [req.params.id])

  if(result.rows.length === 0){
  return res.status(404).json({ error: 'Item not found' })
}
  return res.json(result.rows[0])
  }catch(error){
    next(error)
  }
})


app.delete('/api/data/:id',  async (request, response, next) => {
  try {
    const result= await pool.query('DELETE FROM my_wines WHERE id = $1 RETURNING *', [request.params.id])
    
    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Item not found' })
    }
      response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/data', async (req, res, next) => {
try  {
    const {name, description} =req.body
    if(!name){
    return res.status(400).json({ error: 'name is required' })
    }
    const result = await pool.query(
      'INSERT INTO my_wines(name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name, description || '']
    )
    res.status(201).json(result.rows[0])
  }catch(error) {
 if (error.code === '23505') {
      return res.status(400).json({ error: 'name must be unique' })
    }
    next(error)

  }
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
// console.log("Hello from the backend!");
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { Pool } = require('pg')

const app = express()

// Request size limit (prevent large payloads that consume memory)
app.use(express.json({ limit: '1mb' }))

// Simple rate limiter (max 50 requests per 15 minutes per IP)
const requestCounts = {}
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 50

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  
  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 0, reset: now + RATE_LIMIT_WINDOW }
  }
  
  if (now > requestCounts[ip].reset) {
    requestCounts[ip] = { count: 0, reset: now + RATE_LIMIT_WINDOW }
  }
  
  requestCounts[ip].count++
  
  if (requestCounts[ip].count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  
  next()
}

// Clean up old rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const ip in requestCounts) {
    if (requestCounts[ip].reset < now) {
      delete requestCounts[ip]
    }
  }
}, 30 * 60 * 1000)

app.use(rateLimiter)
app.use(cors())
app.use(express.static(path.join(__dirname, 'dist')))


// Input validation helpers
const validateName = (name) => {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100
}

const validateDescription = (desc) => {
  return typeof desc === 'string' && desc.trim().length > 0 && desc.trim().length <= 1000
}

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
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }
    
    const result=await pool.query('SELECT id, name, description FROM my_wines WHERE id = $1', [id])

    if(result.rows.length === 0){
      return res.status(404).json({ error: 'Item not found' })
    }
    return res.json(result.rows[0])
  }catch(error){
    next(error)
  }
})


app.delete('/api/data/:id', async (request, response, next) => {
  try {
    const id = Number(request.params.id)
    if (isNaN(id)) {
      return response.status(400).json({ error: 'Invalid ID' })
    }

    const result = await pool.query('DELETE FROM my_wines WHERE id = $1 RETURNING *', [id])

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Item not found' })
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/data', async (req, res, next) => {
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


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)



const errorHandler = (error, request, response, next) => {
  console.error('Error:', error.message)

  // Don't expose internal errors to client
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Invalid JSON in request body' })
  }

  response.status(500).json({ error: 'Internal server error' })
}

app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log('Protections active: Rate limiting (50 req/15min), Input validation, Request size limit (1MB)')

})
// console.log("Hello from the backend!");
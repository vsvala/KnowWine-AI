require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const myWinesRouter = require('./controllers/my_wines')

const app = express()

// If this app runs behind a proxy (Render, Heroku, etc.), trust proxy headers
app.set('trust proxy', true)


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
app.use('/api/data', myWinesRouter)


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
    console.log('Serving index.html from backend:', path.join(__dirname, 'dist', 'index.html'))
})


//global middleware for anything not handled by any route.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)


// global middleware for catching errors from all route
const errorHandler = (error, request, response, next) => {
  console.error('Error:', error.message)

  // Don't expose internal errors to client
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Invalid JSON in request body' })
  }

  response.status(500).json({ error: 'Internal server error' })
}

app.use(errorHandler)

const start = async () => {
  try {
    await connectToDatabase()
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log('Protections active: Rate limiting (50 req/15min), Input validation, Request size limit (1MB)')
    })
  } catch (err) {
    console.error('Failed to start application - DB connection error:', err)
    process.exit(1)
  }
}

start()

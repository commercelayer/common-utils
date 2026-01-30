import { Hono } from 'hono'
import { requestId } from "hono/request-id"
import { serve } from '@hono/node-server'
import { honoHttpLogger, createLogger } from '@commercelayer/hono-pino-logger'
import type { Logger } from 'pino'
import { v4 as uuidv4 } from 'uuid'

type Variables = {
  logger: Logger
  requestId: string
}

const app = new Hono<{ Variables: Variables }>()

// Example 1: Basic usage with default logger
app.use(honoHttpLogger())

// Example 2: Add request ID middleware (optional but recommended)
app.use(requestId())

// Example routes demonstrating logger usage
app.get('/', (c) => {
  const logger = c.get('logger')
  logger.info('Home page accessed')

  return c.json({
    message: 'Welcome to Hono with Pino Logger!',
    endpoints: [
      'GET /',
      'GET /users/:id',
      'POST /users',
      'GET /error',
    ],
  })
})

app.get('/users/:id', (c) => {
  const logger = c.get('logger')
  const userId = c.req.param('id')

  logger.info({ userId }, 'Fetching user')

  // Simulate user fetch
  const user = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
  }

  logger.info({ userId }, 'User fetched successfully')

  return c.json(user)
})

app.post('/users', async (c) => {
  const logger = c.get('logger')
  const body = await c.req.json()

  logger.info({ body }, 'Creating new user')

  // Simulate user creation
  const newUser = {
    id: uuidv4(),
    ...body,
  }

  logger.info({ userId: newUser.id }, 'User created successfully')

  return c.json(newUser, 201)
})

app.get('/error', (c) => {
  const logger = c.get('logger')
  logger.error('Simulating an error')

  return c.json({ error: 'Something went wrong' }, 500)
})

app.get('/warn', (c) => {
  const logger = c.get('logger')
  logger.warn('This is a warning example')

  return c.json({ warning: 'This is a warning' }, 400)
})

// Example 3: Custom logger configuration
const customApp = new Hono<{ Variables: Variables }>()

const customLogger = createLogger({
  level: 'debug',
  prettyPrint: true,
})

customApp.use('*', honoHttpLogger({ logger: customLogger }))

customApp.get('/custom', (c) => {
  const logger = c.get('logger')
  logger.debug('Debug message with custom logger')
  return c.text('Using custom logger')
})

// Start server
const port = 3000

console.log(`🚀 Server is running on http://localhost:${port}`)
console.log(`📝 Try these endpoints:`)
console.log(`   GET  http://localhost:${port}/`)
console.log(`   GET  http://localhost:${port}/users/123`)
console.log(`   POST http://localhost:${port}/users`)
console.log(`   GET  http://localhost:${port}/error`)
console.log(`   GET  http://localhost:${port}/warn`)

serve({
  fetch: app.fetch,
  port,
})

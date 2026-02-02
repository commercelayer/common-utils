import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createLogger, honoHttpLogger } from '@commercelayer/hono-pino-logger'
import type { Logger } from 'pino'

type Variables = {
  logger: Logger
}

const app = new Hono<{ Variables: Variables }>()

// Create a custom logger with specific configuration
const customLogger = createLogger({
  level: 'debug',
  prettyPrint: true,
  redactPaths: ['password', 'token', 'apiKey'], // Sensitive fields to redact
})

// Use the custom logger in the middleware
app.use('*', honoHttpLogger({
  logger: customLogger,
  logRequestBody: true, // Enable request body logging
}))

// Example route with sensitive data
app.post('/login', async (c) => {
  const logger = c.get('logger')
  const body = await c.req.json()

  // The password will be redacted from logs
  logger.info({ credentials: body }, 'Login attempt')

  return c.json({
    success: true,
    token: 'secret-token-123'
  })
})

// Example with child logger
app.get('/api/data', (c) => {
  const logger = c.get('logger')

  // Create a child logger with additional context
  const childLogger = logger.child({ service: 'data-api', version: '1.0' })

  childLogger.debug('Fetching data from database')
  childLogger.info('Data fetched successfully')

  return c.json({ data: [1, 2, 3] })
})

// Example with minimal output (only message, no extra attributes)
const minimalApp = new Hono<{ Variables: Variables }>()

minimalApp.use(
  honoHttpLogger({
    minimalOutput: true, // Only logs the message without request_id, ip, etc.
  }),
)

minimalApp.get('/minimal', (c) => {
  const logger = c.get('logger')
  logger.info('Clean minimal log output')
  return c.json({ message: 'Minimal logging enabled' })
})

const port = 3001

console.log(`🚀 Advanced example running on http://localhost:${port}`)
console.log(`📝 Try these endpoints:`)
console.log(`   POST http://localhost:${port}/login (with password)`)
console.log(`   GET  http://localhost:${port}/api/data`)

serve({
  fetch: app.fetch,
  port,
})

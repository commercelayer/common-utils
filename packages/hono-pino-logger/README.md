# @commercelayer/hono-pino-logger

Pino logger middleware for Hono with built-in request/response logging support. Designed for use with `@hono/node-server`.

## Features

- 🚀 Fast and lightweight logging powered by Pino
- 🎯 Seamless integration with Hono applications
- 📊 Automatic HTTP request/response logging
- 🎨 Pretty printing in development
- 🔧 Fully configurable and extensible
- 📦 TypeScript first with complete type definitions
- 🌐 Works with `@hono/node-server`

## Installation

```bash
pnpm add @commercelayer/hono-pino-logger
# or
npm install @commercelayer/hono-pino-logger
# or
yarn add @commercelayer/hono-pino-logger
```

### Peer Dependencies

This package requires:
- `hono` (^4.0.0)
- `@hono/node-server` (^1.0.0)

For development pretty printing, install:
```bash
pnpm add -D pino-pretty
```

## Quick Start

### Basic Usage

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { honoHttpLogger } from '@commercelayer/hono-pino-logger'

const app = new Hono()

// Add logger middleware
app.use('*', honoHttpLogger())

app.get('/', (c) => {
  return c.text('Hello World!')
})

serve(app)
```

### With Custom Logger Configuration

```typescript
import { Hono } from 'hono'
import { createLogger, honoHttpLogger } from '@commercelayer/hono-pino-logger'

const app = new Hono()

// Create a custom logger
const customLogger = createLogger({
  level: 'debug',
  prettyPrint: true,
  redactPaths: ['req.headers.authorization']
})

// Use custom logger in middleware
app.use('*', honoHttpLogger({ logger: customLogger }))

app.get('/', (c) => {
  // Access logger from context
  const logger = c.get('logger')
  logger.info('Processing request')

  return c.json({ message: 'Hello' })
})
```

## API Reference

### `honoHttpLogger(config?)`

Hono middleware for logging HTTP requests and responses.

**Parameters:**
- `config.logger` (optional): Custom Pino logger instance
- `config.logRequestBody` (optional): Log request body (default: `false`)
- `config.minimalOutput` (optional): Only output log message without extra attributes (default: `false`)

**Returns:** Hono middleware function

**Example:**
```typescript
app.use('*', honoHttpLogger({
  logRequestBody: true
}))

// Minimal output (only message, no extra attributes)
app.use('*', honoHttpLogger({
  minimalOutput: true
}))
```

### `createLogger(config?)`

Creates a Pino logger instance with custom configuration.

**Parameters:**
- `config.level` (optional): Minimum log level (default: `process.env.LOG_LEVEL ?? 'info'`)
- `config.prettyPrint` (optional): Enable pretty printing (default: `process.env.NODE_ENV !== 'production'`)
- `config.redactPaths` (optional): Array of paths to redact from logs
- `config.customFormatters` (optional): Custom Pino formatters
- `config.serializers` (optional): Custom Pino serializers

**Returns:** Pino logger instance

**Example:**
```typescript
const logger = createLogger({
  level: 'debug',
  redactPaths: ['password', 'token']
})

logger.info('Application started')
logger.error({ err: new Error('Failed') }, 'Error occurred')
```

### `logger`

Default logger instance using environment-based configuration.

**Example:**
```typescript
import { logger } from '@commercelayer/hono-pino-logger'

logger.info('Using default logger')
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set the minimum log level (default: `info`)
- `NODE_ENV`: When set to `production`, disables pretty printing

**Example:**
```bash
LOG_LEVEL=debug NODE_ENV=development node server.js
```

### Logging Levels

Available log levels (in order of priority):
- `fatal`
- `error`
- `warn`
- `info`
- `debug`
- `trace`

## Advanced Usage

### Access Logger in Route Handlers

The logger is automatically attached to the Hono context:

```typescript
app.get('/user/:id', async (c) => {
  const logger = c.get('logger')
  const userId = c.req.param('id')

  logger.info({ userId }, 'Fetching user')

  // Your logic here

  return c.json({ id: userId })
})
```

### Request ID Tracking

If you set a `requestId` in the Hono context, it will be included in logs:

```typescript
import { requestId } from "hono/request-id"

app.use(requestId())

app.use('*', honoHttpLogger())
```

### Selective Logging

Apply logging only to specific routes:

```typescript
const app = new Hono()

// Log only API routes
app.use('/api/*', honoHttpLogger())

// Public routes without logging
app.get('/', (c) => c.text('Home'))
```

### Minimal Output

For cleaner logs without extra attributes:

```typescript
// Only outputs: method=GET path=/users status=200 duration=45ms
app.use(honoHttpLogger({
  minimalOutput: true
}))

// Default includes: request_id, user_agent, ip, http.request, http.response
app.use(honoHttpLogger())
```

## Log Output

### Development (Pretty Print)

**Default:**
```
[2026-01-29 10:30:45] INFO: method=GET path=/api/users status=200 duration=45ms
    request_id: "abc-123"
    user_agent: "Mozilla/5.0..."
    ip: "192.168.1.1"
```

**Minimal Output:**
```
[2026-01-29 10:30:45] INFO: method=GET path=/api/users status=200 duration=45ms
```

### Production (JSON)

**Default:**
```json
{
  "level": "INFO",
  "time": 1738152645000,
  "msg": "method=GET path=/api/users status=200 duration=45ms",
  "request_id": "abc-123",
  "user_agent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "http": {
    "request": {
      "method": "GET",
      "url": "/api/users"
    },
    "response": {
      "statusCode": 200
    },
    "responseTime": 45
  }
}
```

**Minimal Output:**
```json
{
  "level": "INFO",
  "time": 1738152645000,
  "msg": "method=GET path=/api/users status=200 duration=45ms"
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  LoggerConfig,
  HttpLoggerConfig,
  RequestLogger
} from '@commercelayer/hono-pino-logger'

const config: LoggerConfig = {
  level: 'debug',
  prettyPrint: true
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- [GitHub Issues](https://github.com/commercelayer/common-utils/issues)
- [Documentation](https://github.com/commercelayer/common-utils)

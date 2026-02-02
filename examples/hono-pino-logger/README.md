# Hono Pino Logger - Examples

This directory contains examples demonstrating how to use `@commercelayer/hono-pino-logger` in a Hono application.

## Setup

Install dependencies (from the examples directory):

```bash
pnpm install
```

## Examples

### 1. Basic Example (`src/index.ts`)

Demonstrates basic usage with default configuration:
- Automatic request/response logging
- Request ID tracking
- Using logger in route handlers
- Different log levels (info, warn, error)

Run it:
```bash
pnpm dev
```

Then try:
```bash
# Basic request
curl http://localhost:3000/

# Get user
curl http://localhost:3000/users/123

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'

# Trigger error
curl http://localhost:3000/error

# Trigger warning
curl http://localhost:3000/warn
```

### 2. Advanced Example (`src/advanced.ts`)

Demonstrates advanced features:
- Custom logger configuration
- Log level configuration
- Redacting sensitive data
- Child loggers with additional context
- Request body logging

Run it:
```bash
pnpm tsx src/advanced.ts
```

Then try:
```bash
# Login with sensitive data (password will be redacted)
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

# API with child logger
curl http://localhost:3001/api/data
```

## Expected Log Output

### Development (Pretty Print)
```
[2026-01-29 10:30:45] INFO: method=GET path=/users/123 status=200 duration=5ms
    request_id: "abc-123-def"
    user_agent: "curl/7.88.1"
    ip: "::1"
    userId: "123"
```

### Production (JSON)
```json
{
  "level": "INFO",
  "time": 1738152645000,
  "msg": "method=GET path=/users/123 status=200 duration=5ms",
  "request_id": "abc-123-def",
  "userId": "123"
}
```

## Environment Variables

Control logging behavior with environment variables:

```bash
# Set log level
LOG_LEVEL=debug pnpm dev

# Production mode (JSON output)
NODE_ENV=production pnpm dev

# Development mode (Pretty output)
NODE_ENV=development pnpm dev
```

#!/usr/bin/env node

// Simple test to verify the package works
import { createLogger, honoHttpLogger } from '../../packages/hono-pino-logger/dist/index.js'

console.log('✓ Successfully imported createLogger and honoHttpLogger')

// Test creating a logger
const logger = createLogger({ level: 'info' })
logger.info('Test log message')
console.log('✓ Logger created and working')

// Test creating HTTP logger middleware
honoHttpLogger()
console.log('✓ HTTP logger middleware created')
console.log('✓ All imports and basic functionality working!')

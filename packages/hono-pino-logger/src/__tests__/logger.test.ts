import { beforeEach, describe, expect, it } from 'vitest'
import { createLogger, logger } from '../logger'

describe('createLogger', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL
    delete process.env.NODE_ENV
  })

  it('should create a logger with default configuration', () => {
    const testLogger = createLogger()
    expect(testLogger).toBeDefined()
    expect(testLogger.level).toBe('info')
  })

  it('should respect custom log level', () => {
    const testLogger = createLogger({ level: 'debug' })
    expect(testLogger.level).toBe('debug')
  })

  it('should use LOG_LEVEL environment variable', () => {
    process.env.LOG_LEVEL = 'error'
    const testLogger = createLogger()
    expect(testLogger.level).toBe('error')
  })

  it('should override env with config', () => {
    process.env.LOG_LEVEL = 'error'
    const testLogger = createLogger({ level: 'debug' })
    expect(testLogger.level).toBe('debug')
  })

  it('should create logger with custom formatters', () => {
    const customFormatter = (label: string) => ({ level: label })
    const testLogger = createLogger({
      customFormatters: {
        level: customFormatter,
      },
    })
    expect(testLogger).toBeDefined()
  })

  it('should handle redact paths', () => {
    const testLogger = createLogger({
      redactPaths: ['password', 'apiKey'],
    })
    expect(testLogger).toBeDefined()
  })

  it('should log messages at different levels', () => {
    const testLogger = createLogger({ level: 'debug' })

    // These should not throw
    expect(() => testLogger.debug('debug message')).not.toThrow()
    expect(() => testLogger.info('info message')).not.toThrow()
    expect(() => testLogger.warn('warn message')).not.toThrow()
    expect(() => testLogger.error('error message')).not.toThrow()
  })

  it('should log objects', () => {
    const testLogger = createLogger()
    const testObj = { userId: '123', action: 'login' }

    expect(() => testLogger.info(testObj, 'User action')).not.toThrow()
  })
})

describe('default logger', () => {
  it('should export a default logger instance', () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
  })
})

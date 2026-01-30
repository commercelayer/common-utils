import type { Logger, LoggerOptions } from 'pino'

export interface LoggerConfig {
  /**
   * The minimum log level to output.
   * @default process.env.LOG_LEVEL ?? 'info'
   */
  level?: string

  /**
   * Enable pretty printing in development.
   * @default process.env.NODE_ENV !== 'production'
   */
  prettyPrint?: boolean

  /**
   * Paths to redact from logs (e.g., ['req.headers.authorization']).
   */
  redactPaths?: string[]

  /**
   * Custom formatters for pino.
   */
  customFormatters?: LoggerOptions['formatters']

  /**
   * Custom serializers for pino.
   */
  serializers?: LoggerOptions['serializers']
}

export interface HttpLoggerConfig {
  /**
   * Custom logger instance to use.
   */
  logger?: Logger

  /**
   * Whether to log request body.
   * @default false
   */
  logRequestBody?: boolean

  /**
   * Whether to log response body.
   * @default false
   */
  logResponseBody?: boolean
}

export interface RequestLogger extends Logger {
  /**
   * Request ID passed from Hono context.
   */
  requestId?: string
}

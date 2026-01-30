import type { Logger } from 'pino'
import { pino } from 'pino'
import type { LoggerConfig } from './types'

/**
 * Creates a base Pino logger instance with sensible defaults.
 *
 * @param config - Optional configuration for the logger
 * @returns A configured Pino logger instance
 *
 * @example
 * ```ts
 * const logger = createLogger({ level: 'debug' })
 * logger.info('Application started')
 * ```
 */
export function createLogger(config?: LoggerConfig): Logger {
  const {
    level = process.env.LOG_LEVEL ?? 'info',
    prettyPrint = process.env.NODE_ENV !== 'production',
    redactPaths = [],
    customFormatters,
    serializers,
  } = config ?? {}

  return pino({
    level,
    redact: redactPaths.length > 0 ? redactPaths : undefined,
    transport: prettyPrint
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    formatters: customFormatters ?? {
      level(label) {
        return { level: label.toUpperCase() }
      },
    },
    serializers,
  })
}

/**
 * Default logger instance using environment-based configuration.
 */
export const logger = createLogger()

import type { Context, Next } from 'hono'
import { type HttpLogger, pinoHttp } from 'pino-http'
import { logger as defaultLogger } from './logger'
import type { HttpLoggerConfig } from './types'

/**
 * Creates a configured pino-http instance for logging HTTP requests.
 *
 * @param config - Optional configuration for the HTTP logger
 * @returns A configured pino-http middleware function
 */
export function createHttpLogger(config?: HttpLoggerConfig): HttpLogger {
  const {
    logger = defaultLogger,
    logRequestBody = false,
    minimalOutput = false,
  } = config ?? {}

  return pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn'
      }
      if (res.statusCode >= 500 || err) {
        return 'error'
      }
      return 'info'
    },
    customSuccessMessage: (req, res, responseTime) => {
      const path = req.url?.split('?')[0] || req.url
      return `method=${req.method} path=${path} status=${res.statusCode} duration=${responseTime}ms`
    },
    customErrorMessage: (req, res, err) => {
      const responseTime =
        res.getHeader('X-Response-Time') ||
        res.getHeader('Response-Time') ||
        '0'
      const path = req.url?.split('?')[0] || req.url
      return `method=${req.method} path=${path} status=${res.statusCode} duration=${responseTime}ms - ${err.message}`
    },
    customAttributeKeys: minimalOutput
      ? undefined
      : {
          req: 'http.request',
          res: 'http.response',
          err: 'error',
          responseTime: 'http.responseTime',
        },
    serializers: minimalOutput
      ? {
          req: () => undefined,
          res: () => undefined,
          err: () => undefined,
          responseTime: () => undefined,
        }
      : {
          req: (req) => {
            return {
              method: req.method,
              url: req.url?.split('?')[0],
              query: req.query,
              body: logRequestBody ? req.body : undefined,
              remote_address: req.remoteAddress,
              remote_port: req.remotePort,
            }
          },
        },
    customProps: minimalOutput
      ? undefined
      : (req) => {
          return {
            request_id: req.id,
            user_agent: req.headers['user-agent'],
            host: req.headers.host,
            ip:
              req.headers['x-forwarded-for'] ||
              req.headers['x-real-ip'] ||
              req.socket?.remoteAddress,
            protocol: req.headers['x-forwarded-proto'] || 'http',
          }
        },
  })
}

/**
 * Hono middleware for logging HTTP requests and responses using Pino.
 *
 * This middleware integrates pino-http with Hono applications running on @hono/node-server.
 * It logs all incoming requests with their responses, including status codes, duration,
 * and other relevant HTTP information.
 *
 * @param config - Optional configuration for the HTTP logger
 * @returns Hono middleware function
 *
 * @example
 * ```ts
 * import { Hono } from 'hono'
 * import { honoHttpLogger } from '@commercelayer/hono-pino-logger'
 *
 * const app = new Hono()
 * app.use('*', honoHttpLogger())
 *
 * app.get('/', (c) => c.text('Hello!'))
 * ```
 *
 * @example With custom configuration
 * ```ts
 * import { createLogger, honoHttpLogger } from '@commercelayer/hono-pino-logger'
 *
 * const customLogger = createLogger({ level: 'debug' })
 * app.use('*', honoHttpLogger({ logger: customLogger }))
 * ```
 */
export function honoHttpLogger(config?: HttpLoggerConfig): Promise<void> | ((c: Context, next: Next) => Promise<void>) {
  const httpLogger = createHttpLogger(config)

  return async (c: Context, next: Next) => {
    // @hono/node-server provides incoming/outgoing in c.env
    const req = c.env.incoming
    const res = c.env.outgoing

    if (!req || !res) {
      // Fallback if not using @hono/node-server
      await next()
      return
    }

    // Pass hono's request-id to pino-http if available
    if (c.var?.requestId) {
      req.id = c.var.requestId
    }

    // Map express-style middleware to Hono
    await new Promise<void>((resolve) => httpLogger(req, res, () => resolve()))

    // Attach logger to context for use in route handlers
    c.set('logger', req.log)

    await next()
  }
}

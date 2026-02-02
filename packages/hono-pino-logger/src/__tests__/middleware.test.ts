import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { createHttpLogger, honoHttpLogger } from '../middleware'

describe('createHttpLogger', () => {
  it('should create an http logger function', () => {
    const httpLogger = createHttpLogger()
    expect(httpLogger).toBeDefined()
    expect(typeof httpLogger).toBe('function')
  })

  it('should accept custom logger configuration', () => {
    const httpLogger = createHttpLogger({
      logRequestBody: true,
    })
    expect(httpLogger).toBeDefined()
  })
})

describe('honoHttpLogger', () => {
  it('should return a Hono middleware function', () => {
    const middleware = honoHttpLogger()
    expect(middleware).toBeDefined()
    expect(typeof middleware).toBe('function')
  })

  it('should work as Hono middleware', async () => {
    const app = new Hono()
    app.use('*', honoHttpLogger())
    app.get('/test', (c) => c.text('ok'))

    // Mock the node-server env
    const mockReq: any = {
      method: 'GET',
      url: '/test',
      headers: {},
      socket: {},
    }
    const mockRes: any = {
      statusCode: 200,
      getHeader: vi.fn(),
      setHeader: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
    }

    const mockC: any = {
      env: {
        incoming: mockReq,
        outgoing: mockRes,
      },
      var: {},
      get: vi.fn(),
      set: vi.fn(),
      req: {
        method: 'GET',
        url: '/test',
        path: '/test',
      },
      text: vi.fn(),
    }

    const next = vi.fn().mockResolvedValue(undefined)

    const middleware = honoHttpLogger()
    await middleware(mockC, next)

    expect(next).toHaveBeenCalled()
    expect(mockC.set).toHaveBeenCalledWith('logger', expect.anything())
  })

  it('should handle missing node-server env gracefully', async () => {
    const mockC: any = {
      env: {},
      var: {},
      get: vi.fn(),
      set: vi.fn(),
      req: {
        method: 'GET',
        url: '/test',
      },
    }

    const next = vi.fn().mockResolvedValue(undefined)

    const middleware = honoHttpLogger()
    await middleware(mockC, next)

    // Should call next without errors
    expect(next).toHaveBeenCalled()
  })

  it('should propagate request ID from context', async () => {
    const requestId = 'test-request-id'

    const mockReq: any = {
      method: 'GET',
      url: '/test',
      headers: {},
      socket: {},
    }
    const mockRes: any = {
      statusCode: 200,
      getHeader: vi.fn(),
      setHeader: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
    }

    const mockC: any = {
      env: {
        incoming: mockReq,
        outgoing: mockRes,
      },
      var: {
        requestId,
      },
      get: vi.fn(),
      set: vi.fn(),
      req: {
        method: 'GET',
        url: '/test',
      },
    }

    const next = vi.fn().mockResolvedValue(undefined)

    const middleware = honoHttpLogger()
    await middleware(mockC, next)

    expect(mockReq.id).toBe(requestId)
    expect(next).toHaveBeenCalled()
  })

  it('should accept custom configuration', async () => {
    const middleware = honoHttpLogger({
      logRequestBody: true,
    })

    expect(middleware).toBeDefined()
    expect(typeof middleware).toBe('function')
  })
})

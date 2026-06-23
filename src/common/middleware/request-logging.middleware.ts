import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'

import { AppLogger } from '../logger/app-logger.service'
import { sanitizeForLog } from '../logger/sanitize'

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.header('x-request-id') || randomUUID()
    const startedAt = performance.now()
    const isDevelopment = process.env.NODE_ENV === 'development'

    req.requestId = requestId
    res.setHeader('x-request-id', requestId)

    res.on('finish', () => {
      const durationMs = Math.round(performance.now() - startedAt)
      const context = {
        context: 'HTTP',
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.userId,
        ...(isDevelopment
          ? {
              params: sanitizeForLog(req.params),
              query: sanitizeForLog(req.query),
              body: this.getDevelopmentBody(req)
            }
          : {})
      }

      if (res.statusCode >= 500) {
        this.logger.error('HTTP request completed with server error', context)
      } else if (res.statusCode >= 400) {
        this.logger.warn('HTTP request completed with client error', context)
      } else {
        this.logger.info('HTTP request completed', context)
      }
    })

    this.logger.runWithRequest({ requestId }, next)
  }

  private getDevelopmentBody(req: Request) {
    const body = req.body as Record<string, unknown> | undefined

    // A GraphQL document can contain literals. Log only its useful, structured input.
    if (body && typeof body === 'object' && typeof body.query === 'string') {
      return sanitizeForLog({
        operationName: body.operationName,
        variables: body.variables
      })
    }

    return sanitizeForLog(body)
  }
}

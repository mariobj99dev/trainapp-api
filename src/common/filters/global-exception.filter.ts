import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { GqlArgumentsHost } from '@nestjs/graphql'

import { AppLogger } from '../logger/app-logger.service'
import { sanitizeForLog } from '../logger/sanitize'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<'graphql'>() === 'graphql') {
      const gqlContext = GqlArgumentsHost.create(host).getContext<{ req?: Request }>()
      this.logException(exception, gqlContext.req)
      return exception
    }

    const http = host.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const message = exception instanceof HttpException ? exception.message : 'Internal server error'

    this.logException(exception, request, statusCode)
    response.status(statusCode).json({
      statusCode,
      message,
      requestId: request.requestId
    })
  }

  private logException(exception: unknown, request?: Request, statusCode?: number) {
    const error = exception instanceof Error ? exception : new Error(String(exception))
    const resolvedStatusCode = statusCode || (exception instanceof HttpException ? exception.getStatus() : 500)
    const validationErrors = this.getValidationErrors(exception)
    const context = {
      context: 'ExceptionFilter',
      requestId: request?.requestId,
      method: request?.method,
      url: request?.originalUrl,
      statusCode: resolvedStatusCode,
      userId: request?.user?.userId,
      ...(validationErrors ? { validationErrors } : {}),
      error: sanitizeForLog({
        name: error.name,
        message: error.message,
        ...(resolvedStatusCode >= 500 ? { stack: error.stack } : {})
      })
    }

    if (resolvedStatusCode >= 500) {
      this.logger.error('Unhandled exception', context)
    } else {
      this.logger.warn('Handled client exception', context)
    }
  }

  private getValidationErrors(exception: unknown) {
    if (process.env.NODE_ENV !== 'development' || !(exception instanceof HttpException)) {
      return undefined
    }

    const response = exception.getResponse()
    if (typeof response !== 'object' || response === null || !('validationErrors' in response)) {
      return undefined
    }

    const validationErrors = response.validationErrors
    return Array.isArray(validationErrors) ? validationErrors : undefined
  }
}

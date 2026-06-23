import { Injectable, LoggerService } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import pino, { Logger } from 'pino'
import pinoPretty from 'pino-pretty'

import { sanitizeForLog } from './sanitize'

type LogContext = Record<string, unknown>

interface RequestLogContext {
  requestId: string
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger
  private readonly requestContext = new AsyncLocalStorage<RequestLogContext>()

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const streams: pino.StreamEntry[] = [
      {
        stream: isDevelopment ? pinoPretty({ colorize: true, singleLine: true, translateTime: 'SYS:standard' }) : process.stdout
      }
    ]

    if (process.env.LOG_TO_FILE === 'true') {
      const logDir = process.env.LOG_DIR || '/app/logs'
      mkdirSync(logDir, { recursive: true })
      streams.push({ stream: pino.destination(join(logDir, 'application.log')) })
    }

    this.logger = pino(
      {
        level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
        base: undefined,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label })
        }
      },
      pino.multistream(streams)
    )
  }

  runWithRequest<T>(context: RequestLogContext, callback: () => T): T {
    return this.requestContext.run(context, callback)
  }

  debug(message: string, context?: LogContext) {
    this.write('debug', message, context)
  }

  log(message: string, context?: LogContext) {
    this.info(message, context)
  }

  info(message: string, context?: LogContext) {
    this.write('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.write('warn', message, context)
  }

  error(message: string, traceOrContext?: string | LogContext, context?: LogContext) {
    const traceContext = typeof traceOrContext === 'string' ? { stack: traceOrContext } : traceOrContext
    this.write('error', message, { ...traceContext, ...context })
  }

  fatal(message: string, context?: LogContext) {
    this.write('fatal', message, context)
  }

  private write(level: 'debug' | 'info' | 'warn' | 'error' | 'fatal', message: string, context?: LogContext) {
    this.logger[level](sanitizeForLog({ ...this.requestContext.getStore(), ...context }) as Record<string, unknown>, message)
  }
}

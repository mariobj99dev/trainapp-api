import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { AppLogger } from './common/logger/app-logger.service'
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware'
import { formatValidationErrors } from './common/logger/validation-details'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = app.get(AppLogger)
  const requestLoggingMiddleware = new RequestLoggingMiddleware(logger)

  app.useLogger(logger)
  app.use(requestLoggingMiddleware.use.bind(requestLoggingMiddleware))
  app.useGlobalFilters(new GlobalExceptionFilter(logger))

  const stopAfterUnexpectedError = (message: string, error: unknown) => {
    logger.fatal(message, { context: 'Process', error })
    void app.close().finally(() => process.exit(1))
  }
  process.on('uncaughtException', (error) => stopAfterUnexpectedError('Uncaught exception', error))
  process.on('unhandledRejection', (reason) => stopAfterUnexpectedError('Unhandled promise rejection', reason))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const validationErrors = formatValidationErrors(errors)
        logger.warn('Validation failed', {
          context: 'ValidationPipe',
          validationErrors
        })
        return new BadRequestException(
          process.env.NODE_ENV === 'development'
            ? { message: 'Validation failed', validationErrors }
            : 'Validation failed'
        )
      }
    })
  )

  const configService = app.get(ConfigService)
  const port = configService.getOrThrow<number>('PORT')

  await app.listen(port)
  logger.info('Application started', {
    context: 'Bootstrap',
    environment: configService.getOrThrow<string>('NODE_ENV'),
    port
  })
}

void bootstrap()

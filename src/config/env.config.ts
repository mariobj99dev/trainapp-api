type EnvConfig = {
  PORT: number
  NODE_ENV: string
  DATABASE_URL: string
  JWT_ACCESS_SECRET: string
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_PASSWORD: string
  LOG_LEVEL: string
  LOG_TO_FILE: string
  LOG_DIR: string
}

const requiredVariables = ['PORT', 'NODE_ENV', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'REDIS_HOST', 'REDIS_PORT'] as const
const logLevels = new Set(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'])

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  for (const variable of requiredVariables) {
    if (typeof config[variable] !== 'string' || config[variable].trim() === '') {
      throw new Error(`Missing required environment variable: ${variable}`)
    }
  }

  const port = Number(config.PORT)
  const redisPort = Number(config.REDIS_PORT)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer')
  }

  if (!Number.isInteger(redisPort) || redisPort <= 0) {
    throw new Error('REDIS_PORT must be a positive integer')
  }

  if (typeof config.LOG_LEVEL === 'string' && config.LOG_LEVEL !== '' && !logLevels.has(config.LOG_LEVEL)) {
    throw new Error('LOG_LEVEL must be a valid Pino log level')
  }

  if (typeof config.LOG_TO_FILE === 'string' && !['true', 'false', ''].includes(config.LOG_TO_FILE)) {
    throw new Error('LOG_TO_FILE must be true or false')
  }

  return {
    PORT: port,
    NODE_ENV: String(config.NODE_ENV),
    DATABASE_URL: String(config.DATABASE_URL),
    JWT_ACCESS_SECRET: String(config.JWT_ACCESS_SECRET),
    REDIS_HOST: String(config.REDIS_HOST),
    REDIS_PORT: redisPort,
    REDIS_PASSWORD: typeof config.REDIS_PASSWORD === 'string' ? config.REDIS_PASSWORD : '',
    LOG_LEVEL: typeof config.LOG_LEVEL === 'string' ? config.LOG_LEVEL : '',
    LOG_TO_FILE: typeof config.LOG_TO_FILE === 'string' ? config.LOG_TO_FILE : 'false',
    LOG_DIR: typeof config.LOG_DIR === 'string' ? config.LOG_DIR : ''
  }
}

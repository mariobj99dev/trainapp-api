type EnvConfig = {
  PORT: number
  NODE_ENV: string
  DATABASE_URL: string
  JWT_ACCESS_SECRET: string
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_PASSWORD: string
}

const requiredVariables = ['PORT', 'NODE_ENV', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'REDIS_HOST', 'REDIS_PORT'] as const

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

  return {
    PORT: port,
    NODE_ENV: String(config.NODE_ENV),
    DATABASE_URL: String(config.DATABASE_URL),
    JWT_ACCESS_SECRET: String(config.JWT_ACCESS_SECRET),
    REDIS_HOST: String(config.REDIS_HOST),
    REDIS_PORT: redisPort,
    REDIS_PASSWORD: typeof config.REDIS_PASSWORD === 'string' ? config.REDIS_PASSWORD : ''
  }
}

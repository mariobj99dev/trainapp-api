import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { createHash, timingSafeEqual } from 'crypto'
import { v4 as uuid } from 'uuid'

import { RedisService } from '../../redis/redis.service'
import { AuthTokens } from '../types/auth-tokens.type'
import { AuthTokenService } from './auth-token.service'

type StoredSession = {
  userId: string
  deviceId: string
  deviceName?: string
  refreshTokenHash: string
  createdAt: string
  lastUsedAt: string
}

type UserSession = {
  sessionId: string
  deviceId: string
  deviceName?: string
  createdAt: Date
  lastUsedAt: Date
  isCurrent: boolean
}

@Injectable()
export class SessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly authTokenService: AuthTokenService
  ) {}

  async create(userId: string, deviceId: string, deviceName?: string): Promise<AuthTokens> {
    const sessionId = uuid()
    const refreshToken = this.authTokenService.createRefreshToken(sessionId)
    const { tokenSecret } = this.authTokenService.getRefreshTokenParts(refreshToken)
    const refreshTokenHash = this.hashRefreshTokenSecret(tokenSecret)
    const expiresAt = this.authTokenService.getRefreshTokenExpiresAt()
    const ttlSeconds = this.getTtlSeconds(expiresAt)
    const existingSessionId = await this.redisService.getClient().get(this.getDeviceSessionKey(userId, deviceId))

    if (existingSessionId) {
      await this.revoke(existingSessionId)
    }

    const now = new Date().toISOString()
    const sessionKey = this.getSessionKey(sessionId)
    const deviceSessionKey = this.getDeviceSessionKey(userId, deviceId)
    const userSessionsKey = this.getUserSessionsKey(userId)
    const sessionData: StoredSession = {
      userId,
      deviceId,
      refreshTokenHash,
      createdAt: now,
      lastUsedAt: now
    }

    if (deviceName) {
      sessionData.deviceName = deviceName
    }

    await this.redisService
      .getClient()
      .pipeline()
      .hset(sessionKey, sessionData)
      .expire(sessionKey, ttlSeconds)
      .set(deviceSessionKey, sessionId, 'EX', ttlSeconds)
      .sadd(userSessionsKey, deviceId)
      .expire(userSessionsKey, ttlSeconds)
      .exec()

    return {
      accessToken: this.authTokenService.createAccessToken(userId, sessionId),
      refreshToken
    }
  }

  async rotateRefreshToken(refreshToken: string) {
    const { sessionId, tokenSecret } = this.authTokenService.getRefreshTokenParts(refreshToken)
    const session = await this.getSession(sessionId)

    if (!session) {
      throw new UnauthorizedException('Refresh token invalido')
    }

    const refreshTokenMatches = await this.refreshTokenMatches(tokenSecret, session.refreshTokenHash)

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token invalido')
    }

    await this.revoke(sessionId)

    return {
      userId: session.userId,
      tokens: await this.create(session.userId, session.deviceId, session.deviceName)
    }
  }

  async revoke(sessionId: string) {
    const session = await this.getRawSession(sessionId)
    const pipeline = this.redisService.getClient().pipeline().del(this.getSessionKey(sessionId))

    if (session.userId && session.deviceId) {
      pipeline.del(this.getDeviceSessionKey(session.userId, session.deviceId))
      pipeline.srem(this.getUserSessionsKey(session.userId), session.deviceId)
    }

    await pipeline.exec()
  }

  async revokeForUser(userId: string, sessionId: string) {
    const session = await this.getSession(sessionId)

    if (!session) {
      return false
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('No puedes revocar esta sesion')
    }

    await this.revoke(sessionId)

    return true
  }

  async isSessionValid(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId)

    if (!session || session.userId !== userId) {
      return false
    }

    await this.redisService.getClient().hset(this.getSessionKey(sessionId), 'lastUsedAt', new Date().toISOString())

    return true
  }

  async findUserSessions(userId: string, currentSessionId: string) {
    const deviceIds = await this.redisService.getClient().smembers(this.getUserSessionsKey(userId))
    const sessions: UserSession[] = []

    for (const deviceId of deviceIds) {
      const sessionId = await this.redisService.getClient().get(this.getDeviceSessionKey(userId, deviceId))

      if (!sessionId) {
        await this.redisService.getClient().srem(this.getUserSessionsKey(userId), deviceId)
        continue
      }

      const session = await this.getSession(sessionId)

      if (!session || session.userId !== userId) {
        await this.redisService.getClient().srem(this.getUserSessionsKey(userId), deviceId)
        continue
      }

      sessions.push({
        sessionId,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        createdAt: new Date(session.createdAt),
        lastUsedAt: new Date(session.lastUsedAt),
        isCurrent: sessionId === currentSessionId
      })
    }

    return sessions.sort((left, right) => right.lastUsedAt.getTime() - left.lastUsedAt.getTime())
  }

  private async getSession(sessionId: string) {
    const session = await this.getRawSession(sessionId)

    if (!Object.keys(session).length) {
      return null
    }

    if (!session.userId || !session.deviceId || !session.refreshTokenHash || !session.createdAt || !session.lastUsedAt) {
      await this.revoke(sessionId)
      return null
    }

    return session as StoredSession
  }

  private getRawSession(sessionId: string) {
    return this.redisService.getClient().hgetall(this.getSessionKey(sessionId))
  }

  private async refreshTokenMatches(tokenSecret: string, storedHash: string) {
    if (storedHash.startsWith('$2')) {
      return bcrypt.compare(tokenSecret, storedHash)
    }

    const tokenHash = this.hashRefreshTokenSecret(tokenSecret)
    const tokenHashBuffer = Buffer.from(tokenHash)
    const storedHashBuffer = Buffer.from(storedHash)

    return tokenHashBuffer.length === storedHashBuffer.length && timingSafeEqual(tokenHashBuffer, storedHashBuffer)
  }

  private hashRefreshTokenSecret(tokenSecret: string) {
    return createHash('sha256').update(tokenSecret).digest('base64url')
  }

  private getSessionKey(sessionId: string) {
    return `sessions:${sessionId}`
  }

  private getDeviceSessionKey(userId: string, deviceId: string) {
    return `user_sessions:${userId}:${deviceId}`
  }

  private getUserSessionsKey(userId: string) {
    return `user_sessions:${userId}`
  }

  private getTtlSeconds(expiresAt: Date) {
    return Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))
  }
}

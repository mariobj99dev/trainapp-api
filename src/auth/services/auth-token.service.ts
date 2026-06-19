import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

import { JwtPayload } from '../types/auth.types'

@Injectable()
export class AuthTokenService {
  private readonly accessTokenExpiresInSeconds = 15 * 60
  private readonly refreshTokenExpiresInDays = 7
  private readonly secret: string

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('JWT_ACCESS_SECRET')
  }

  createAccessToken(userId: string, sessionId: string) {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const payload: JwtPayload = {
      sub: userId,
      sessionId,
      iat: nowInSeconds,
      exp: nowInSeconds + this.accessTokenExpiresInSeconds
    }

    return this.sign(payload)
  }

  createRefreshToken(sessionId: string) {
    return `${sessionId}.${randomBytes(48).toString('base64url')}`
  }

  getRefreshTokenExpiresAt() {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiresInDays)
    return expiresAt
  }

  verifyAccessToken(token: string) {
    const [encodedHeader, encodedPayload, signature] = token.split('.')

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Token invalido')
    }

    const expectedSignature = this.signPart(`${encodedHeader}.${encodedPayload}`)

    if (!this.signaturesMatch(signature, expectedSignature)) {
      throw new UnauthorizedException('Token invalido')
    }

    let payload: JwtPayload

    try {
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload
    } catch {
      throw new UnauthorizedException('Token invalido')
    }

    if (!payload.sub || !payload.sessionId || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expirado')
    }

    return payload
  }

  getRefreshTokenParts(refreshToken: string) {
    const [sessionId, tokenSecret] = refreshToken.split('.')

    if (!sessionId || !tokenSecret) {
      throw new UnauthorizedException('Refresh token invalido')
    }

    return { sessionId, tokenSecret }
  }

  private sign(payload: JwtPayload) {
    const encodedHeader = this.encode({
      alg: 'HS256',
      typ: 'JWT'
    })
    const encodedPayload = this.encode(payload)
    const signature = this.signPart(`${encodedHeader}.${encodedPayload}`)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private signPart(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url')
  }

  private encode(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url')
  }

  private signaturesMatch(signature: string, expectedSignature: string) {
    const signatureBuffer = Buffer.from(signature)
    const expectedSignatureBuffer = Buffer.from(expectedSignature)

    return signatureBuffer.length === expectedSignatureBuffer.length && timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  }
}

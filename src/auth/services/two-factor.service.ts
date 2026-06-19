import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt } from 'crypto'
import { toDataURL } from 'qrcode'
import { v4 as uuid } from 'uuid'

import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'

type LoginChallenge = {
  userId: string
  attempts: number
}

@Injectable()
export class TwoFactorService {
  private readonly issuer = 'TrainApp'
  private readonly setupTtlSeconds = 10 * 60
  private readonly challengeTtlSeconds = 5 * 60
  private readonly maxChallengeAttempts = 5
  private readonly encryptionKey: Buffer

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    configService: ConfigService
  ) {
    const secret = configService.getOrThrow<string>('JWT_ACCESS_SECRET')
    this.encryptionKey = createHash('sha256').update(secret).digest()
  }

  async startSetup(userId: string) {
    const existing = await this.prisma.userTwoFactor.findUnique({
      where: { userId },
      select: { enabled: true }
    })

    if (existing?.enabled) {
      throw new ConflictException('2FA ya esta activo')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    const secret = this.generateBase32Secret()
    const otpauthUri = this.createOtpAuthUri(user.email, secret)

    await this.redisService.getClient().set(this.getSetupKey(userId), secret, 'EX', this.setupTtlSeconds)

    return {
      otpauthUri,
      qrCodeDataUrl: await toDataURL(otpauthUri),
      manualEntryKey: secret
    }
  }

  async confirmSetup(userId: string, code: string) {
    this.assertTotpCode(code)

    const secret = await this.redisService.getClient().get(this.getSetupKey(userId))

    if (!secret || !this.verifyTotp(code, secret)) {
      throw new BadRequestException('Codigo 2FA invalido')
    }

    const now = new Date()
    const recoveryCodes = this.generateRecoveryCodes()
    const recoveryCodeRows = await Promise.all(
      recoveryCodes.map(async (recoveryCode) => ({
        id: uuid(),
        userId,
        codeHash: await bcrypt.hash(this.normalizeRecoveryCode(recoveryCode), 12),
        createdAt: now
      }))
    )

    await this.prisma.$transaction([
      this.prisma.userTwoFactor.upsert({
        where: { userId },
        create: {
          id: uuid(),
          userId,
          secret: this.encrypt(secret),
          enabled: true,
          confirmedAt: now,
          createdAt: now,
          updatedAt: now
        },
        update: {
          secret: this.encrypt(secret),
          enabled: true,
          confirmedAt: now,
          updatedAt: now
        }
      }),
      this.prisma.recoveryCode.deleteMany({
        where: { userId }
      }),
      this.prisma.recoveryCode.createMany({
        data: recoveryCodeRows
      })
    ])

    await this.redisService.getClient().del(this.getSetupKey(userId))

    return {
      enabled: true,
      recoveryCodes
    }
  }

  async disable(userId: string, code: string) {
    const valid = await this.verifyUserCode(userId, code)

    if (!valid) {
      throw new UnauthorizedException('Codigo 2FA invalido')
    }

    await this.prisma.$transaction([
      this.prisma.recoveryCode.deleteMany({ where: { userId } }),
      this.prisma.userTwoFactor.deleteMany({ where: { userId } })
    ])

    return true
  }

  async isEnabled(userId: string) {
    const twoFactor = await this.prisma.userTwoFactor.findUnique({
      where: { userId },
      select: { enabled: true }
    })

    return Boolean(twoFactor?.enabled)
  }

  async createLoginChallenge(userId: string) {
    const challengeToken = randomBytes(32).toString('base64url')
    const challenge: LoginChallenge = {
      userId,
      attempts: 0
    }

    await this.redisService.getClient().set(this.getChallengeKey(challengeToken), JSON.stringify(challenge), 'EX', this.challengeTtlSeconds)

    return challengeToken
  }

  async verifyLoginChallenge(challengeToken: string, code: string) {
    const challengeKey = this.getChallengeKey(challengeToken)
    const rawChallenge = await this.redisService.getClient().get(challengeKey)

    if (!rawChallenge) {
      throw new UnauthorizedException('Challenge 2FA invalido')
    }

    const challenge = JSON.parse(rawChallenge) as LoginChallenge
    const valid = await this.verifyUserCode(challenge.userId, code)

    if (!valid) {
      challenge.attempts += 1

      if (challenge.attempts >= this.maxChallengeAttempts) {
        await this.redisService.getClient().del(challengeKey)
      } else {
        await this.redisService.getClient().set(challengeKey, JSON.stringify(challenge), 'EX', this.challengeTtlSeconds)
      }

      throw new UnauthorizedException('Credenciales invalidas')
    }

    await this.redisService.getClient().del(challengeKey)

    return challenge.userId
  }

  private async verifyUserCode(userId: string, code: string) {
    const normalizedCode = code.trim()
    const twoFactor = await this.prisma.userTwoFactor.findUnique({
      where: { userId },
      select: {
        secret: true,
        enabled: true
      }
    })

    if (!twoFactor?.enabled) {
      return false
    }

    if (/^\d{6}$/.test(normalizedCode) && this.verifyTotp(normalizedCode, this.decrypt(twoFactor.secret))) {
      return true
    }

    return this.verifyRecoveryCode(userId, normalizedCode)
  }

  private async verifyRecoveryCode(userId: string, code: string) {
    const normalizedCode = this.normalizeRecoveryCode(code)
    const recoveryCodes = await this.prisma.recoveryCode.findMany({
      where: {
        userId,
        usedAt: null
      },
      select: {
        id: true,
        codeHash: true
      }
    })

    for (const recoveryCode of recoveryCodes) {
      const matches = await bcrypt.compare(normalizedCode, recoveryCode.codeHash)

      if (matches) {
        await this.prisma.recoveryCode.update({
          where: { id: recoveryCode.id },
          data: { usedAt: new Date() }
        })

        return true
      }
    }

    return false
  }

  private verifyTotp(code: string, secret: string) {
    const currentStep = Math.floor(Date.now() / 1000 / 30)

    for (let offset = -1; offset <= 1; offset += 1) {
      if (this.generateTotp(secret, currentStep + offset) === code) {
        return true
      }
    }

    return false
  }

  private generateTotp(secret: string, counter: number) {
    const key = this.decodeBase32(secret)
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeBigUInt64BE(BigInt(counter))

    const hmac = createHmac('sha1', key).update(counterBuffer).digest()
    const offset = hmac[hmac.length - 1] & 0x0f
    const binary =
      ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)

    return String(binary % 1_000_000).padStart(6, '0')
  }

  private createOtpAuthUri(email: string, secret: string) {
    const label = encodeURIComponent(`${this.issuer}:${email}`)
    const issuer = encodeURIComponent(this.issuer)

    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  }

  private generateBase32Secret() {
    return this.encodeBase32(randomBytes(20))
  }

  private generateRecoveryCodes() {
    return Array.from({ length: 10 }, () => `${this.randomRecoveryPart()}-${this.randomRecoveryPart()}`)
  }

  private randomRecoveryPart() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let value = ''

    for (let index = 0; index < 4; index += 1) {
      value += alphabet[randomInt(alphabet.length)]
    }

    return value
  }

  private normalizeRecoveryCode(code: string) {
    return code.trim().toUpperCase()
  }

  private assertTotpCode(code: string) {
    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('El codigo 2FA debe tener 6 digitos')
    }
  }

  private encodeBase32(buffer: Buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = 0
    let value = 0
    let output = ''

    for (const byte of buffer) {
      value = (value << 8) | byte
      bits += 8

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31]
    }

    return output
  }

  private decodeBase32(value: string) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = 0
    let buffer = 0
    const bytes: number[] = []

    for (const character of value.replace(/=+$/g, '').toUpperCase()) {
      const index = alphabet.indexOf(character)

      if (index === -1) {
        throw new BadRequestException('Secret 2FA invalido')
      }

      buffer = (buffer << 5) | index
      bits += 5

      if (bits >= 8) {
        bytes.push((buffer >>> (bits - 8)) & 255)
        bits -= 8
      }
    }

    return Buffer.from(bytes)
  }

  private encrypt(value: string) {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return `${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
  }

  private decrypt(value: string) {
    const [iv, tag, encrypted] = value.split(':')

    if (!iv || !tag || !encrypted) {
      throw new BadRequestException('Secret 2FA invalido')
    }

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))

    return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
  }

  private getSetupKey(userId: string) {
    return `two_factor_setup:${userId}`
  }

  private getChallengeKey(challengeToken: string) {
    return `two_factor_login:${challengeToken}`
  }
}

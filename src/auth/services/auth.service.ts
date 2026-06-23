import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'

import { PrismaService } from '../../prisma/prisma.service'
import { publicUserSelect } from '../../users/selectors/public-user.select'
import { PublicUser } from '../../users/types/public-user.type'
import { LoginInput } from '../dto/login.input'
import { RegisterInput } from '../dto/register.input'
import { VerifyTwoFactorLoginInput } from '../dto/verify-two-factor-login.input'
import { SessionService } from './session.service'
import { TwoFactorService } from './two-factor.service'
import { AppLogger } from '../../common/logger/app-logger.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly twoFactorService: TwoFactorService,
    private readonly logger: AppLogger
  ) {}

  async register(input: RegisterInput) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }]
      }
    })

    if (existingUser) {
      this.logger.warn('Registration rejected: user already exists', { context: 'AuthService' })
      throw new ConflictException('El email o username ya esta en uso')
    }

    const passwordHash = await bcrypt.hash(input.password, 12)
    const now = new Date()

    const user = await this.prisma.user.create({
      data: {
        id: uuid(),
        email: input.email,
        username: input.username,
        status: 'ACTIVE',
        isAdmin: false,
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            id: uuid(),
            displayName: input.displayName,
            createdAt: now,
            updatedAt: now
          }
        },
        credential: {
          create: {
            id: uuid(),
            passwordHash,
            createdAt: now,
            updatedAt: now
          }
        },
        authProviders: {
          create: {
            id: uuid(),
            provider: 'CREDENTIALS',
            providerUserId: input.email,
            providerEmail: input.email,
            createdAt: now
          }
        }
      },
      select: publicUserSelect
    })

    this.logger.info('User registered', { context: 'AuthService', userId: user.id })
    return this.buildAuthResponse(user, input.deviceId, input.deviceName)
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: input.email
      },
      select: {
        ...publicUserSelect,
        credential: {
          select: {
            passwordHash: true
          }
        }
      }
    })

    if (!user?.credential) {
      this.logger.warn('Login rejected: invalid credentials', { context: 'AuthService' })
      throw new UnauthorizedException('Credenciales invalidas')
    }

    const passwordMatches = await bcrypt.compare(input.password, user.credential.passwordHash)

    if (!passwordMatches) {
      this.logger.warn('Login rejected: invalid credentials', { context: 'AuthService' })
      throw new UnauthorizedException('Credenciales invalidas')
    }

    const { credential: _credential, ...publicUser } = user

    if (await this.twoFactorService.isEnabled(publicUser.id)) {
      this.logger.info('Two-factor authentication challenge requested', { context: 'AuthService', userId: publicUser.id })
      return {
        requiresTwoFactor: true,
        twoFactorChallengeToken: await this.twoFactorService.createLoginChallenge(publicUser.id)
      }
    }

    return this.buildAuthResponse(publicUser, input.deviceId, input.deviceName)
  }

  async verifyTwoFactorLogin(input: VerifyTwoFactorLoginInput) {
    const userId = await this.twoFactorService.verifyLoginChallenge(input.twoFactorChallengeToken, input.code)
    const user = await this.findPublicUserOrThrow(userId)

    return this.buildAuthResponse(user, input.deviceId, input.deviceName)
  }

  async refreshToken(refreshToken: string) {
    const { userId, tokens } = await this.sessionService.rotateRefreshToken(refreshToken)
    const user = await this.findPublicUserOrThrow(userId)

    return {
      ...tokens,
      user
    }
  }

  async logout(sessionId: string) {
    await this.sessionService.revoke(sessionId)
    this.logger.info('Session revoked', { context: 'AuthService' })
    return true
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.sessionService.revokeForUser(userId, sessionId)
  }

  async sessions(userId: string, currentSessionId: string) {
    return this.sessionService.findUserSessions(userId, currentSessionId)
  }

  async me(userId: string) {
    return this.findPublicUserOrThrow(userId)
  }

  async startTwoFactorSetup(userId: string) {
    return this.twoFactorService.startSetup(userId)
  }

  async confirmTwoFactorSetup(userId: string, code: string) {
    return this.twoFactorService.confirmSetup(userId, code)
  }

  async disableTwoFactor(userId: string, code: string) {
    return this.twoFactorService.disable(userId, code)
  }

  private async buildAuthResponse(user: PublicUser, deviceId: string, deviceName?: string) {
    const tokens = await this.sessionService.create(user.id, deviceId, deviceName)
    this.logger.info('Session created', { context: 'AuthService', userId: user.id })

    return {
      requiresTwoFactor: false,
      ...tokens,
      user
    }
  }

  private async findPublicUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: publicUserSelect
    })

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    return user
  }
}

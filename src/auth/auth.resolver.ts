import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { UserModel } from '../users/models/user.model'
import { CurrentUser } from './decorators/current-user.decorator'
import { LoginInput } from './dto/login.input'
import { RefreshTokenInput } from './dto/refresh-token.input'
import { RegisterInput } from './dto/register.input'
import { VerifyTwoFactorLoginInput } from './dto/verify-two-factor-login.input'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AuthResponseModel } from './models/auth-response.model'
import { AuthSessionModel } from './models/auth-session.model'
import { LoginResponseModel } from './models/login-response.model'
import { TwoFactorConfirmationModel } from './models/two-factor-confirmation.model'
import { TwoFactorSetupModel } from './models/two-factor-setup.model'
import { AuthService } from './services/auth.service'
import type { AuthenticatedUser } from './types/auth.types'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseModel, { description: 'Creates an account and a session for the supplied device.' })
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input)
  }

  @Mutation(() => LoginResponseModel, {
    description: 'Signs in. If two-factor authentication is enabled, returns a challenge and does not issue tokens yet.'
  })
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input)
  }

  @Mutation(() => AuthResponseModel, { description: 'Completes a two-factor sign-in challenge and issues a new session.' })
  verifyTwoFactorLogin(@Args('input') input: VerifyTwoFactorLoginInput) {
    return this.authService.verifyTwoFactorLogin(input)
  }

  @Mutation(() => AuthResponseModel, { description: 'Rotates a valid refresh token and issues a new token pair for its session.' })
  refreshToken(@Args('input') input: RefreshTokenInput) {
    return this.authService.refreshToken(input.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Revokes the currently authenticated session.' })
  logout(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.logout(currentUser.sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Revokes an owned session by sessionId. Sessions belonging to other users cannot be revoked.' })
  revokeSession(@CurrentUser() currentUser: AuthenticatedUser, @Args('sessionId') sessionId: string) {
    return this.authService.revokeSession(currentUser.userId, sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorSetupModel, { description: 'Starts two-factor setup and returns data for enrolling an authenticator.' })
  startTwoFactorSetup(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.startTwoFactorSetup(currentUser.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorConfirmationModel, {
    description: 'Enables two-factor authentication after verifying a TOTP code and returns single-use recovery codes.'
  })
  confirmTwoFactorSetup(@CurrentUser() currentUser: AuthenticatedUser, @Args('code') code: string) {
    return this.authService.confirmTwoFactorSetup(currentUser.userId, code)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Disables two-factor authentication after validating a TOTP or recovery code.' })
  disableTwoFactor(@CurrentUser() currentUser: AuthenticatedUser, @Args('code') code: string) {
    return this.authService.disableTwoFactor(currentUser.userId, code)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [AuthSessionModel], { description: 'Lists active sessions of the authenticated user, ordered by most recent use.' })
  sessions(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.sessions(currentUser.userId, currentUser.sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserModel, { description: 'Returns the public profile of the authenticated user.' })
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.me(currentUser.userId)
  }
}

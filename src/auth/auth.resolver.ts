import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
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
import { UserModel } from '../users/models/user.model'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseModel)
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input)
  }

  @Mutation(() => LoginResponseModel)
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input)
  }

  @Mutation(() => AuthResponseModel)
  verifyTwoFactorLogin(@Args('input') input: VerifyTwoFactorLoginInput) {
    return this.authService.verifyTwoFactorLogin(input)
  }

  @Mutation(() => AuthResponseModel)
  refreshToken(@Args('input') input: RefreshTokenInput) {
    return this.authService.refreshToken(input.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logout(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.logout(currentUser.sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  revokeSession(@CurrentUser() currentUser: AuthenticatedUser, @Args('sessionId') sessionId: string) {
    return this.authService.revokeSession(currentUser.userId, sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorSetupModel)
  startTwoFactorSetup(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.startTwoFactorSetup(currentUser.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorConfirmationModel)
  confirmTwoFactorSetup(@CurrentUser() currentUser: AuthenticatedUser, @Args('code') code: string) {
    return this.authService.confirmTwoFactorSetup(currentUser.userId, code)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  disableTwoFactor(@CurrentUser() currentUser: AuthenticatedUser, @Args('code') code: string) {
    return this.authService.disableTwoFactor(currentUser.userId, code)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [AuthSessionModel])
  sessions(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.sessions(currentUser.userId, currentUser.sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserModel)
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.me(currentUser.userId)
  }
}

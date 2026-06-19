import { Module } from '@nestjs/common'
import { RedisModule } from '../redis/redis.module'
import { AuthResolver } from './auth.resolver'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AuthService } from './services/auth.service'
import { AuthTokenService } from './services/auth-token.service'
import { SessionService } from './services/session.service'
import { TwoFactorService } from './services/two-factor.service'

@Module({
  imports: [RedisModule],
  providers: [AuthResolver, AuthService, AuthTokenService, SessionService, TwoFactorService, JwtAuthGuard],
  exports: [AuthTokenService, SessionService, TwoFactorService, JwtAuthGuard]
})
export class AuthModule {}

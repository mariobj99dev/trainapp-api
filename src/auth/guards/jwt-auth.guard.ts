import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { AuthTokenService } from '../services/auth-token.service'
import { SessionService } from '../services/session.service'
import { GraphqlContext } from '../types/auth.types'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly sessionService: SessionService
  ) {}

  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext<GraphqlContext>()
    const authorizationHeader = gqlContext.req.headers.authorization
    const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.slice('Bearer '.length) : undefined

    if (!token) {
      throw new UnauthorizedException('Token requerido')
    }

    const payload = this.authTokenService.verifyAccessToken(token)
    const sessionIsValid = await this.sessionService.isSessionValid(payload.sessionId, payload.sub)

    if (!sessionIsValid) {
      throw new UnauthorizedException('Sesion invalida')
    }

    gqlContext.req.user = {
      userId: payload.sub,
      sessionId: payload.sessionId
    }

    return true
  }
}

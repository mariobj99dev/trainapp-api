import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { AuthenticatedUser, GraphqlContext } from '../types/auth.types'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const gqlContext = GqlExecutionContext.create(context).getContext<GraphqlContext>()
  return gqlContext.req.user as AuthenticatedUser
})

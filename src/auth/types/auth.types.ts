export type AuthenticatedUser = {
  userId: string
  sessionId: string
}

export type JwtPayload = {
  sub: string
  sessionId: string
  iat: number
  exp: number
}

export type GraphqlContext = {
  req: {
    headers: {
      authorization?: string
    }
    user?: AuthenticatedUser
  }
}

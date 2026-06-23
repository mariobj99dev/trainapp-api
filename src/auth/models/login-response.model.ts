import { Field, ObjectType } from '@nestjs/graphql'

import { UserModel } from '../../users/models/user.model'

@ObjectType({ description: 'Result of a password sign-in attempt, including the 2FA branch when required.' })
export class LoginResponseModel {
  @Field({ description: 'True when verifyTwoFactorLogin must be called before tokens are issued.' })
  requiresTwoFactor: boolean

  @Field({ nullable: true, description: 'Temporary challenge required only when requiresTwoFactor is true.' })
  twoFactorChallengeToken?: string

  @Field({ nullable: true, description: 'Access JWT. Present only when requiresTwoFactor is false.' })
  accessToken?: string

  @Field({ nullable: true, description: 'Refresh token. Present only when requiresTwoFactor is false.' })
  refreshToken?: string

  @Field(() => UserModel, { nullable: true, description: 'Authenticated user. Present only when requiresTwoFactor is false.' })
  user?: UserModel
}

import { Field, ObjectType } from '@nestjs/graphql'

import { UserModel } from '../../users/models/user.model'

@ObjectType()
export class LoginResponseModel {
  @Field()
  requiresTwoFactor: boolean

  @Field({ nullable: true })
  twoFactorChallengeToken?: string

  @Field({ nullable: true })
  accessToken?: string

  @Field({ nullable: true })
  refreshToken?: string

  @Field(() => UserModel, { nullable: true })
  user?: UserModel
}

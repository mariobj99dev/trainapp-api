import { Field, ObjectType } from '@nestjs/graphql'

import { UserModel } from '../../users/models/user.model'

@ObjectType({ description: 'Tokens and public user data returned after successful authentication.' })
export class AuthResponseModel {
  @Field({ description: 'Short-lived JWT used as the Bearer token for protected operations.' })
  accessToken: string

  @Field({ description: 'Opaque token used only to obtain a rotated token pair.' })
  refreshToken: string

  @Field(() => UserModel, { description: 'Public data for the authenticated user.' })
  user: UserModel
}

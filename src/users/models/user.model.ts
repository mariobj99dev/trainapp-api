import { Field, ObjectType } from '@nestjs/graphql'
import { ProfileModel } from './profile.model'

@ObjectType({ description: 'Public user account data. It never includes credentials, tokens, or 2FA secrets.' })
export class UserModel {
  @Field({ description: 'User UUID.' })
  id: string

  @Field({ description: 'Account email address.' })
  email: string

  @Field({ description: 'Unique username.' })
  username: string

  @Field({ description: 'Current account status.' })
  status: string

  @Field({ description: 'Whether the account has administrator privileges.' })
  isAdmin: boolean

  @Field({ description: 'Time when the account was created.' })
  createdAt: Date

  @Field(() => ProfileModel, { nullable: true, description: 'Optional public profile associated with the account.' })
  profile?: ProfileModel
}

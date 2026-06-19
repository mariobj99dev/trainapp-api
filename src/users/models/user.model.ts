import { Field, ObjectType } from '@nestjs/graphql'
import { ProfileModel } from './profile.model'

@ObjectType()
export class UserModel {
  @Field()
  id: string

  @Field()
  email: string

  @Field()
  username: string

  @Field()
  status: string

  @Field()
  isAdmin: boolean

  @Field()
  createdAt: Date

  @Field(() => ProfileModel, { nullable: true })
  profile?: ProfileModel
}

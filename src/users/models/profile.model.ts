import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ProfileModel {
  @Field()
  id: string

  @Field()
  displayName: string

  @Field({ nullable: true })
  avatarUrl?: string
}

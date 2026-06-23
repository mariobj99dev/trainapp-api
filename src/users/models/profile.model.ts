import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Public profile data associated with a user.' })
export class ProfileModel {
  @Field({ description: 'Profile UUID.' })
  id: string

  @Field({ description: 'Public display name.' })
  displayName: string

  @Field({ nullable: true, description: 'Optional avatar URL.' })
  avatarUrl?: string
}

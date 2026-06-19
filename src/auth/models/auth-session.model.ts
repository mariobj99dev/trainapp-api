import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AuthSessionModel {
  @Field()
  sessionId: string

  @Field()
  deviceId: string

  @Field({ nullable: true })
  deviceName?: string

  @Field()
  createdAt: Date

  @Field()
  lastUsedAt: Date

  @Field()
  isCurrent: boolean
}

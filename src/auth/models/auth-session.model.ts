import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Metadata for an active user session. No session tokens are exposed.' })
export class AuthSessionModel {
  @Field({ description: 'Server-generated identifier used to revoke this session.' })
  sessionId: string

  @Field({ description: 'Stable client device identifier associated with the session.' })
  deviceId: string

  @Field({ nullable: true, description: 'Optional human-readable device name.' })
  deviceName?: string

  @Field({ description: 'Time when the session was created.' })
  createdAt: Date

  @Field({ description: 'Time when this session last authenticated a protected request.' })
  lastUsedAt: Date

  @Field({ description: 'Whether this is the session that made the request.' })
  isCurrent: boolean
}

import { Field, InputType } from '@nestjs/graphql'
import { IsString, MinLength } from 'class-validator'

@InputType({ description: 'Refresh token for an active session.' })
export class RefreshTokenInput {
  @Field({ description: 'Refresh token received after registration, sign-in, or a previous refresh.' })
  @IsString()
  @MinLength(20)
  refreshToken: string
}

import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

@InputType()
export class VerifyTwoFactorLoginInput {
  @Field()
  @IsString()
  @MinLength(20)
  twoFactorChallengeToken: string

  @Field()
  @IsString()
  @Matches(/^(\d{6}|[A-Z0-9]{4}-[A-Z0-9]{4})$/i)
  code: string

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  deviceId: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceName?: string
}

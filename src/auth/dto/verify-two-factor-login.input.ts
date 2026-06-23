import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

@InputType({ description: 'Data used to complete a two-factor sign-in challenge.' })
export class VerifyTwoFactorLoginInput {
  @Field({ description: 'Temporary challenge returned by login when requiresTwoFactor is true.' })
  @IsString()
  @MinLength(20)
  twoFactorChallengeToken: string

  @Field({ description: 'Six-digit TOTP code or a recovery code in XXXX-XXXX format.' })
  @IsString()
  @Matches(/^(\d{6}|[A-Z0-9]{4}-[A-Z0-9]{4})$/i)
  code: string

  @Field({ description: 'Stable client device identifier (8 to 128 characters).' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  deviceId: string

  @Field({ nullable: true, description: 'Human-readable device name shown in the session list.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceName?: string
}

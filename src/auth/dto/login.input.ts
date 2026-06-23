import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

@InputType({ description: 'Credentials and device data used to sign in.' })
export class LoginInput {
  @Field({ description: 'Account email address.' })
  @IsEmail()
  email: string

  @Field({ description: 'Account password. It is never returned in API responses.' })
  @IsString()
  @MinLength(8)
  password: string

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

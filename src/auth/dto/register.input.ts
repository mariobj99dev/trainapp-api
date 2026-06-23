import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

@InputType({ description: 'Data used to create a local account and its first session.' })
export class RegisterInput {
  @Field({ description: 'Unique account email address.' })
  @IsEmail()
  email: string

  @Field({ description: 'Unique username, from 3 to 50 characters.' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @Field({ description: 'Public display name shown in the profile.' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  displayName: string

  @Field({ description: 'Initial password, at least 8 characters. It is never returned.' })
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

import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  displayName: string

  @Field()
  @IsString()
  @MinLength(8)
  password: string

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

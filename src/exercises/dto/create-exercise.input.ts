import { Field, InputType } from '@nestjs/graphql'
import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator'

@InputType({ description: 'Data used to create a private exercise for the authenticated user.' })
export class CreateExerciseInput {
  @Field({ description: 'Non-blank exercise name, up to 255 characters.' })
  @IsString()
  @MaxLength(255)
  @Matches(/\S/)
  name: string

  @Field(() => String, { nullable: true, description: 'Optional exercise description.' })
  @IsOptional()
  @IsString()
  description?: string | null

  @Field(() => [String], {
    nullable: true,
    description: 'Optional unique equipment UUIDs accessible to the authenticated user (maximum 100).'
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  // System equipment uses stable UUID-shaped identifiers such as
  // 00000000-0000-0000-0000-000000000001. PostgreSQL accepts these values,
  // but they are not RFC UUID v4 values.
  @IsUUID('loose', { each: true })
  equipmentIds?: string[]
}

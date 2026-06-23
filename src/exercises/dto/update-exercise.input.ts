import { Field, InputType } from '@nestjs/graphql'
import { ArrayMaxSize, ArrayUnique, IsArray, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator'

@InputType({ description: 'Changes to a private exercise owned by the authenticated user.' })
export class UpdateExerciseInput {
  @Field({ description: 'UUID of the USER-scoped exercise to update.' })
  @IsUUID('4')
  id: string

  @Field(() => String, { nullable: true, description: 'New non-blank name, up to 255 characters.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/)
  name?: string

  @Field(() => String, { nullable: true, description: 'New optional description. Send null to clear it.' })
  @IsOptional()
  @IsString()
  description?: string | null

  @Field(() => [String], {
    nullable: true,
    description: 'Replacement list of unique accessible equipment UUIDs (maximum 100). Send an empty list to remove all associations.'
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  // Keep this aligned with CreateExerciseInput and the UUID column in PostgreSQL.
  @IsUUID('loose', { each: true })
  equipmentIds?: string[]
}

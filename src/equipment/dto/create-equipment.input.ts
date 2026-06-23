import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator'

@InputType({ description: 'Data used to create private equipment for the authenticated user.' })
export class CreateEquipmentInput {
  @Field({ description: 'Non-blank equipment name, up to 255 characters.' })
  @IsString()
  @MaxLength(255)
  @Matches(/\S/)
  name: string

  @Field(() => String, { nullable: true, description: 'Optional equipment description.' })
  @IsOptional()
  @IsString()
  description?: string | null
}

import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator'

@InputType({ description: 'Changes to private equipment owned by the authenticated user.' })
export class UpdateEquipmentInput {
  @Field({ description: 'UUID of the USER-scoped equipment to update.' })
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
}

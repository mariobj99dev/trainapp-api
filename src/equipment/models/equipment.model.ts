import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Equipment accessible to the authenticated user.' })
export class EquipmentModel {
  @Field({ description: 'Equipment UUID.' })
  id: string

  @Field({ description: 'SYSTEM for catalog equipment or USER for equipment owned by the requester.' })
  scope: string

  @Field({ description: 'Equipment name.' })
  name: string

  @Field(() => String, { nullable: true, description: 'Optional equipment description.' })
  description?: string | null

  @Field({ description: 'Time when the equipment was created.' })
  createdAt: Date

  @Field({ description: 'Time when the equipment was last updated.' })
  updatedAt: Date
}

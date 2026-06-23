import { Field, ObjectType } from '@nestjs/graphql'

import { EquipmentModel } from '../../equipment/models/equipment.model'

@ObjectType({ description: 'Exercise accessible to the authenticated user, with its associated equipment.' })
export class ExerciseModel {
  @Field({ description: 'Exercise UUID.' })
  id: string

  @Field({ description: 'SYSTEM for catalog exercises or USER for exercises owned by the requester.' })
  scope: string

  @Field({ description: 'Exercise name.' })
  name: string

  @Field(() => String, { nullable: true, description: 'Optional exercise description.' })
  description?: string | null

  @Field({ description: 'Time when the exercise was created.' })
  createdAt: Date

  @Field({ description: 'Time when the exercise was last updated.' })
  updatedAt: Date

  @Field(() => [EquipmentModel], { description: 'Equipment associated with the exercise.' })
  equipment: EquipmentModel[]
}

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../auth/types/auth.types'
import { CreateEquipmentInput } from './dto/create-equipment.input'
import { UpdateEquipmentInput } from './dto/update-equipment.input'
import { EquipmentModel } from './models/equipment.model'
import { EquipmentService } from './equipment.service'

@Resolver(() => EquipmentModel)
@UseGuards(JwtAuthGuard)
export class EquipmentResolver {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Query(() => [EquipmentModel], { description: 'Lists system equipment and equipment owned by the authenticated user.' })
  equipment(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.equipmentService.findAll(currentUser.userId)
  }

  @Query(() => EquipmentModel, { description: 'Gets accessible equipment: system-owned or owned by the authenticated user.' })
  equipmentById(@Args('id') id: string, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.equipmentService.findOne(id, currentUser.userId)
  }

  @Mutation(() => EquipmentModel, { description: 'Creates private equipment for the authenticated user.' })
  createEquipment(@Args('input') input: CreateEquipmentInput, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.equipmentService.create(currentUser.userId, input)
  }

  @Mutation(() => EquipmentModel, { description: 'Updates private equipment owned by the user. SYSTEM equipment cannot be modified.' })
  updateEquipment(@Args('input') input: UpdateEquipmentInput, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.equipmentService.update(currentUser.userId, input)
  }
}

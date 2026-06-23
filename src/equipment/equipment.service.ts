import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

import { PrismaService } from '../prisma/prisma.service'
import { CreateEquipmentInput } from './dto/create-equipment.input'
import { UpdateEquipmentInput } from './dto/update-equipment.input'

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.equipment.findMany({
      where: this.accessibleWhere(userId),
      orderBy: [{ scope: 'asc' }, { name: 'asc' }]
    })
  }

  async findOne(id: string, userId: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        ...this.accessibleWhere(userId)
      }
    })

    if (!equipment) {
      throw new NotFoundException('Material no encontrado')
    }

    return equipment
  }

  create(userId: string, input: CreateEquipmentInput) {
    const now = new Date()

    return this.prisma.equipment.create({
      data: {
        id: uuid(),
        userId,
        scope: 'USER',
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now
      }
    })
  }

  async update(userId: string, input: UpdateEquipmentInput) {
    if (input.name === undefined && input.description === undefined) {
      throw new BadRequestException('Debes indicar al menos un campo para actualizar')
    }

    await this.findOwned(input.id, userId)

    return this.prisma.equipment.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        updatedAt: new Date()
      }
    })
  }

  private accessibleWhere(userId: string) {
    return {
      OR: [{ scope: 'SYSTEM' }, { scope: 'USER', userId }]
    }
  }

  private async findOwned(id: string, userId: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        scope: 'USER',
        userId
      }
    })

    if (!equipment) {
      throw new NotFoundException('Material no encontrado')
    }

    return equipment
  }
}

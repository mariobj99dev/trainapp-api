import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

import { PrismaService } from '../prisma/prisma.service'
import { CreateExerciseInput } from './dto/create-exercise.input'
import { UpdateExerciseInput } from './dto/update-exercise.input'

const exerciseWithEquipmentSelect = {
  id: true,
  scope: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  exerciseEquipment: {
    select: {
      equipment: true
    }
  }
} as const

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const exercises = await this.prisma.exercise.findMany({
      where: this.accessibleWhere(userId),
      select: exerciseWithEquipmentSelect,
      orderBy: [{ scope: 'asc' }, { name: 'asc' }]
    })

    return exercises.map((exercise) => this.toExerciseModel(exercise))
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id,
        ...this.accessibleWhere(userId)
      },
      select: exerciseWithEquipmentSelect
    })

    if (!exercise) {
      throw new NotFoundException('Ejercicio no encontrado')
    }

    return this.toExerciseModel(exercise)
  }

  async create(userId: string, input: CreateExerciseInput) {
    const equipmentIds = input.equipmentIds ?? []
    await this.ensureEquipmentIsAccessible(equipmentIds, userId)

    const now = new Date()
    const exercise = await this.prisma.exercise.create({
      data: {
        id: uuid(),
        userId,
        scope: 'USER',
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
        exerciseEquipment: {
          create: equipmentIds.map((equipmentId) => ({ equipmentId }))
        }
      },
      select: exerciseWithEquipmentSelect
    })

    return this.toExerciseModel(exercise)
  }

  async update(userId: string, input: UpdateExerciseInput) {
    if (input.name === undefined && input.description === undefined && input.equipmentIds === undefined) {
      throw new BadRequestException('Debes indicar al menos un campo para actualizar')
    }

    await this.findOwned(input.id, userId)

    if (input.equipmentIds !== undefined) {
      await this.ensureEquipmentIsAccessible(input.equipmentIds, userId)
    }

    const exercise = await this.prisma.exercise.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.equipmentIds !== undefined && {
          exerciseEquipment: {
            deleteMany: {},
            create: input.equipmentIds.map((equipmentId) => ({ equipmentId }))
          }
        }),
        updatedAt: new Date()
      },
      select: exerciseWithEquipmentSelect
    })

    return this.toExerciseModel(exercise)
  }

  private accessibleWhere(userId: string) {
    return {
      OR: [{ scope: 'SYSTEM' }, { scope: 'USER', userId }]
    }
  }

  private async findOwned(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id,
        scope: 'USER',
        userId
      }
    })

    if (!exercise) {
      throw new NotFoundException('Ejercicio no encontrado')
    }

    return exercise
  }

  private async ensureEquipmentIsAccessible(equipmentIds: string[], userId: string) {
    if (equipmentIds.length === 0) {
      return
    }

    const equipmentCount = await this.prisma.equipment.count({
      where: {
        id: { in: equipmentIds },
        ...this.accessibleWhere(userId)
      }
    })

    if (equipmentCount !== equipmentIds.length) {
      throw new BadRequestException('Uno o mas materiales no estan disponibles')
    }
  }

  private toExerciseModel(exercise: {
    id: string
    scope: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    exerciseEquipment: {
      equipment: { id: string; scope: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }
    }[]
  }) {
    const { exerciseEquipment, ...exerciseModel } = exercise

    return {
      ...exerciseModel,
      equipment: exerciseEquipment.map(({ equipment }) => equipment)
    }
  }
}

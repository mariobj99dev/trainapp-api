import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../auth/types/auth.types'
import { CreateExerciseInput } from './dto/create-exercise.input'
import { UpdateExerciseInput } from './dto/update-exercise.input'
import { ExercisesService } from './exercises.service'
import { ExerciseModel } from './models/exercise.model'

@Resolver(() => ExerciseModel)
@UseGuards(JwtAuthGuard)
export class ExercisesResolver {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Query(() => [ExerciseModel], { description: 'Lists system exercises and exercises owned by the authenticated user.' })
  exercises(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.exercisesService.findAll(currentUser.userId)
  }

  @Query(() => ExerciseModel, { description: 'Gets an accessible exercise: system-owned or owned by the authenticated user.' })
  exerciseById(@Args('id') id: string, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.exercisesService.findOne(id, currentUser.userId)
  }

  @Mutation(() => ExerciseModel, { description: 'Creates a private exercise and can associate accessible equipment.' })
  createExercise(@Args('input') input: CreateExerciseInput, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.exercisesService.create(currentUser.userId, input)
  }

  @Mutation(() => ExerciseModel, { description: 'Updates a private exercise owned by the user. SYSTEM exercises cannot be modified.' })
  updateExercise(@Args('input') input: UpdateExerciseInput, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.exercisesService.update(currentUser.userId, input)
  }
}

import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { ExercisesResolver } from './exercises.resolver'
import { ExercisesService } from './exercises.service'

@Module({
  imports: [AuthModule],
  providers: [ExercisesResolver, ExercisesService]
})
export class ExercisesModule {}

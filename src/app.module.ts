import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Request } from 'express'
import { join } from 'path'

import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { EquipmentModule } from './equipment/equipment.module'
import { ExercisesModule } from './exercises/exercises.module'
import { ConfigModule } from '@nestjs/config'
import { RedisModule } from './redis/redis.module'
import { validateEnv } from './config/env.config'
import { LoggerModule } from './common/logger/logger.module'

const schemaPath = process.env.NODE_ENV === 'production' ? '/tmp/schema.gql' : join(process.cwd(), 'src/schema.gql')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    LoggerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: schemaPath,
      context: ({ req }: { req: Request }) => ({ req }),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development'
    }),

    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    EquipmentModule,
    ExercisesModule
  ]
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Request } from 'express'
import { join } from 'path'

import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { RedisModule } from './redis/redis.module'
import { validateEnv } from './config/env.config'

const schemaPath =
    process.env.NODE_ENV === 'production'
        ? '/tmp/schema.gql'
        : join(process.cwd(), 'src/schema.gql')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: schemaPath,
      context: ({ req }: { req: Request }) => ({ req }),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production'
    }),

    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule
  ]
})
export class AppModule {}
import { UseGuards } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import { UserModel } from './models/user.model'

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel], { description: 'Lists public user profiles. Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  users() {
    return this.usersService.findAll()
  }
}

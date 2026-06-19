import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { publicUserSelect } from './selectors/public-user.select'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect
    })
  }
}

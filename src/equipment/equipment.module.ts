import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { EquipmentResolver } from './equipment.resolver'
import { EquipmentService } from './equipment.service'

@Module({
  imports: [AuthModule],
  providers: [EquipmentResolver, EquipmentService],
  exports: [EquipmentService]
})
export class EquipmentModule {}

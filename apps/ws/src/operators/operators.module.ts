import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { OperatorTenantEntity } from './operator-tenant.entity';
import { OperatorUserEntity } from './operator-user.entity';
import { OperatorEntity } from './operator.entity';
import { OperatorService } from './operator.service';
import { OperatorsController } from './operators.controller';

@Module({
  controllers: [OperatorsController],
  imports: [SharedModule, MikroOrmModule.forFeature([OperatorEntity, OperatorUserEntity, OperatorTenantEntity])],
  providers: [OperatorService]
})
export class OperatorsModule {}

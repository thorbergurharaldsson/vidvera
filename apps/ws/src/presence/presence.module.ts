import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PresenceSessionEntity } from './presence-session.entity';
import { PresenceService } from './presence.service';
import { SharedModule } from '../shared/shared.module';
import { TenantUserPresenceEntity } from './tenant-user-presence.entity';

@Module({
  imports: [MikroOrmModule.forFeature([PresenceSessionEntity, TenantUserPresenceEntity]), SharedModule],
  exports: [PresenceService],
  providers: [PresenceService]
})
export class PresenceModule {}

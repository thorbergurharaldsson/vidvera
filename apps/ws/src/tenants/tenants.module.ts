import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { PresenceModule } from '../presence/presence.module';
import { ScopesModule } from '../scopes/scopes.module';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { TenantInviteEntity } from './tenant-invite.entity';
import { TenantEntity } from './tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [SharedModule, MikroOrmModule.forFeature([TenantEntity, TenantInviteEntity]), UsersModule, ScopesModule, PresenceModule],
  controllers: [TenantsController],
  providers: [TenantsService]
})
export class TenantsModule {}

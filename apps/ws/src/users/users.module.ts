import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { TenantUserEntity } from './tenant-user.entity';
import { TenantUsersService } from './tenant-users.service';
import { UserEntity } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [forwardRef(() => SharedModule), MikroOrmModule.forFeature([UserEntity, TenantUserEntity]), PresenceModule],
  exports: [UsersService, TenantUsersService],
  controllers: [UsersController],
  providers: [UsersService, TenantUsersService]
})
export class UsersModule {}

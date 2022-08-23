import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ScopeEntity } from './scope.entity';
import { ScopesService } from './scopes.service';

@Module({
  imports: [SharedModule, MikroOrmModule.forFeature([ScopeEntity])],
  providers: [ScopesService],
  exports: [ScopesService]
})
export class ScopesModule {}

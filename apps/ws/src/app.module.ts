import { Logger, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityCaseNamingStrategy, MikroORM } from '@mikro-orm/core';

import { commonConfig, commonConfigSchema } from '@nestjs-snerpa/common';

import mikroOrmConfig from '../mikro-orm.config';
import { appConfig, appConfigSchema, databaseConfig, keycloakConfig, mailConfig } from './config';
import { HealthController } from './health.controller';
import { SharedModule } from './shared/shared.module';
import { MikroOrmHealthIndicator } from './mikro-orm.health';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ScopesModule } from './scopes/scopes.module';
import { PresenceModule } from './presence/presence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, commonConfig, keycloakConfig, mailConfig],
      validationSchema: appConfigSchema.append(commonConfigSchema)
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...mikroOrmConfig,
        type: configService.get('database.type'),
        host: configService.get('database.host'),
        dbName: configService.get('database.name'),
        user: configService.get('database.user'),
        password: configService.get('database.password'),
        namingStrategy: EntityCaseNamingStrategy,
        autoLoadEntities: true // Required to use MikroORM in monorepo
      })
    }),
    TerminusModule,
    SharedModule,
    TenantsModule,
    UsersModule,
    ScopesModule,
    PresenceModule
  ],
  controllers: [HealthController],
  providers: [MikroOrmHealthIndicator]
})
export class AppModule {
  private logger = new Logger(this.constructor.name);

  constructor(private orm: MikroORM, private configService: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const migrator = this.orm.getMigrator();

    const pending = await migrator.getPendingMigrations();

    if (pending.length > 0 && !this.configService.get('database.automaticMigrations')) {
      this.logger.warn(`${pending.length} migration(s) pending but automatic migrations are disabled.`);
    }

    if (pending.length > 0 && this.configService.get('database.automaticMigrations')) {
      this.logger.log(`${pending.length} Migrations Pending, running migrations...`);
      await migrator.up();
      this.logger.log(`Successfully ran ${pending.length} migrations`);
    }
  }
}

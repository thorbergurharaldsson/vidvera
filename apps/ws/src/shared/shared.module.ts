/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommonModule } from '@nestjs-snerpa/common';
import { KeycloakModule } from '@nestjs-snerpa/keycloak';
import { VidveraTokenValidationService } from '../vidvera-token-validation.service';
import { UserContext } from './user.context';

@Module({
  imports: [
    CommonModule,
    HttpModule,
    KeycloakModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          realms: [
            {
              client_id: configService.get('keycloak.client_id')!,
              issuer: configService.get('keycloak.issuer')!,
              client_secret: configService.get('keycloak.client_secret')!
            }
          ]
        })
      },
      {
        validator: {
          inject: [EntityManager],
          TokenValidator: VidveraTokenValidationService
        }
      }
    )
  ],
  providers: [UserContext],
  exports: [CommonModule, HttpModule, KeycloakModule, UserContext]
})
export class SharedModule {}

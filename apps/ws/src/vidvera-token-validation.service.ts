import { Injectable } from '@nestjs/common';
import { KeycloakTokenClaims, TokenValidationService } from '@nestjs-snerpa/keycloak';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserEntity } from './users/user.entity';

@Injectable()
export class VidveraTokenValidationService extends TokenValidationService {
  constructor(private em: EntityManager) {
    super();
  }

  async validate<P extends KeycloakTokenClaims = KeycloakTokenClaims>(payload: P): Promise<KeycloakTokenClaims> {
    return this.validateUser(payload);
  }

  async validateUser(user: KeycloakTokenClaims) {
    let entity = await this.em.findOne(UserEntity, user.sub);
    if (!entity) {
      entity = this.em.create(UserEntity, new UserEntity(user.sub, user.name, user.email));
      await this.em.persistAndFlush(entity);
    }
    return user;
  }
}

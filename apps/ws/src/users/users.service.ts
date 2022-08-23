import { EntityManager } from '@mikro-orm/postgresql';
import { KeycloakService } from '@nestjs-snerpa/keycloak';
import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserDTO, ViewUserDTO, ViewUserProfileDTO } from '@vidvera/core';
import { UserContext } from '../shared/user.context';

import { UserEntity } from './user.entity';

/**
 * Service to manage application users
 */
@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);

  constructor(private em: EntityManager, private keycloak: KeycloakService, private userContext: UserContext) {}

  /**
   * Fetch logged in user profile
   */
  public async getUserProfile(id: string): Promise<ViewUserProfileDTO> {
    const user = await this.em.findOne(
      UserEntity,
      {
        id
      },
      { populate: ['tenants', 'tenants.scopes', 'tenants.presence', 'tenants.tenant'] }
    );

    if (!user || (!this.userContext.isSuperuser() && !this.userContext.isAuthenticatedUser(id))) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tenants: user.tenants.toArray().map((tenant) => ({
        tenantId: tenant.tenant.id,
        userId: tenant.id,
        name: tenant.tenant.name,
        displayName: tenant.tenant.displayName,
        role: tenant.role
      }))
    };
  }

  /**
   * Fetch all users
   * @returns Users
   * */
  public async fetchUsers(
    filters?: {
      name?: string;
      email?: string;
      tenant?: string;
    },
    pagination?: { page?: number; size?: number }
  ) {
    const page = pagination?.page ?? 0;
    const size = pagination?.size ?? 25;
    const query = this.em.createQueryBuilder(UserEntity, 'user');

    if (filters?.tenant) {
      query.andWhere({
        tenants: {
          tenant: {
            $or: [
              {
                name: {
                  $ilike: `%${filters.tenant}%`
                }
              },
              {
                displayName: {
                  $ilike: `%${filters.tenant}%`
                }
              },
              {
                id: filters.tenant
              }
            ]
          }
        }
      });
    }

    if (filters?.name) {
      query.andWhere({ name: { $ilike: `%${filters.name}%` } });
    }
    if (filters?.email) {
      query.andWhere({ email: { $ilike: `%${filters.email}%` } });
    }

    query.limit(size);
    query.offset(size * page);

    return {
      page,
      size,
      total: await query.getCount(),
      items: (await query.leftJoinAndSelect('tenants', 'tenants').getResult()).map((user) => this.userEntityToDTO(user))
    };
  }

  /**
   * Fetch a single user by its id
   * @param id User id
   * @returns User
   */
  public async fetchUser(id: string): Promise<ViewUserDTO> {
    const entity = await this.em.findOne(
      UserEntity,
      {
        id
      },
      { populate: ['tenants.scopes', 'tenants.tenant'] }
    );

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    return this.userEntityToDTO(entity);
  }

  /**
   * Update a user
   * @param id User id
   * @param user User to update
   * @returns Updated user
   *  */
  public async updateUser(id: string, user: UpdateUserDTO) {
    const entity = await this.em.findOne(UserEntity, {
      id
    });

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    try {
      const adminClient = await this.keycloak.createRealmClient();
      await adminClient.users.update({ id: id }, { email: user.email });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response.status !== HttpStatus.NOT_FOUND) {
        throw error;
      }
    }

    this.em.assign(entity, user);
    await this.em.persistAndFlush(entity);

    this.logger.log(`User ${entity.id} updated`);

    return this.userEntityToDTO(entity);
  }

  /**
   * Delete a user
   * @param id User id
   * @returns Deleted user
   * */
  public async deleteUser(id: string) {
    const entity = await this.em.findOne(UserEntity, {
      id
    });

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    try {
      const adminClient = await this.keycloak.createRealmClient();
      await adminClient.users.del({ id: id });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response.status !== HttpStatus.NOT_FOUND) {
        throw e;
      }
    }
    await this.em.removeAndFlush(entity);

    this.logger.log(`User ${entity.id} deleted`);
  }

  private userEntityToDTO(entity: UserEntity): ViewUserDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}

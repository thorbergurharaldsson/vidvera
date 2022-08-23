import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, Scope } from '@nestjs/common';
import * as uuid from 'uuid';

import { ScopeEntity } from '../scopes/scope.entity';
import { UserContext } from '../shared/user.context';
import { TenantEntity } from './tenant.entity';
import { TenantUserEntity } from '../users/tenant-user.entity';
import { UserEntity } from '../users/user.entity';
import { CreateTenantDTO, OperatorTenantStatus, TenantRole, UpdateTenantDTO, ViewOperatorTenantDTO, ViewTenantDTO } from '@vidvera/core';
import { OperatorTenantEntity } from '../operators/operator-tenant.entity';
import { PaginatedList } from '@nestjs-snerpa/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantsService {
  logger = new Logger(TenantsService.name);

  constructor(private em: EntityManager, private userContext: UserContext) {}

  public async fetchTenants(
    filters?: { name?: string; operator?: string },
    pagination?: { page?: number; size?: number }
  ): Promise<PaginatedList<ViewTenantDTO>> {
    const page = pagination?.page ?? 0;
    const size = pagination?.size ?? 25;
    const query = this.em.createQueryBuilder(TenantEntity, 'tenant');
    if (filters?.name) {
      query.andWhere({ displayName: { $ilike: `%${filters.name}%` } });
    }

    if (filters?.operator) {
      query.leftJoinAndSelect('operator', 'operator').andWhere({ operator: { id: filters.operator } });
    }

    query.limit(size);
    query.offset(size * page);

    return {
      page,
      size,
      total: await query.getCount(),
      items: (await query.leftJoinAndSelect('scopes', 'scopes').getResult()).map(this.tenantEntityToDTO)
    };
  }

  /**
   * Fetch a single tenant by its id
   *
   * @param idOrName Tenant id or name
   */
  public async fetchTenant(tenantIdOrName: string): Promise<ViewTenantDTO> {
    const entity = await this.em.findOne(
      TenantEntity,
      uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          },
      { populate: ['scopes', 'users'] }
    );

    if (!entity || !(await this.userContext.hasTenantAccess(tenantIdOrName))) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantEntityToDTO(entity);
  }

  /**
   * Create a new tenant
   * @param data Tenant to create
   * @returns Created tenant
   */
  public async createTenant(data: CreateTenantDTO): Promise<ViewTenantDTO> {
    const tenant = this.em.create(TenantEntity, new TenantEntity(data.name.trim().toLowerCase(), data.displayName.trim()));

    if (data.scopes) {
      data.scopes.forEach((scope) => {
        const scopeEntity = this.em.create(ScopeEntity, new ScopeEntity(scope.name, scope.color, tenant));
        tenant.scopes.add(scopeEntity);
      });
    }

    /**
     * If a normal user is creating a new tenant, he/she will be added as an admin on that tenant
     */
    if (!this.userContext.isSuperuser()) {
      let user = await this.em.findOne(UserEntity, { id: this.userContext.userId });

      // In theory, this should never happen because the token validator should create the user automatically on the first api request, but just in case
      if (!user) {
        user = this.em.create(UserEntity, new UserEntity(this.userContext.userId, this.userContext.user.name, this.userContext.user.email));
        this.em.persist(user);
      }

      const tenantUser = this.em.create(TenantUserEntity, new TenantUserEntity(tenant, user, TenantRole.Admin));

      this.em.persist(tenantUser);
    }

    await this.em.persistAndFlush(tenant);

    this.logger.log(`Created tenant ${tenant.name} (${tenant.id})`);

    return this.tenantEntityToDTO(tenant);
  }

  /**
   * Update a tenant
   * @param idOrName Tenant id or name
   * @param tenant Tenant to update
   * @returns Updated tenant
   */
  public async updateTenant(tenantIdOrName: string, tenant: UpdateTenantDTO) {
    const entity = await this.em.findOne(
      TenantEntity,
      uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    );

    if (!entity) {
      throw new NotFoundException('Tenant not found');
    }
    this.em.assign(entity, tenant);
    await this.em.persistAndFlush(entity);

    this.logger.log(`Updated tenant ${entity.name} (${entity.id})`);

    return this.tenantEntityToDTO(entity);
  }

  /**
   * Delete a tenant
   * @param idOrName Tenant id
   * @returns Deleted tenant
   */
  public async deleteTenant(tenantIdOrName: string) {
    const entity = await this.em.findOne(
      TenantEntity,
      uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    );
    if (!entity) {
      throw new NotFoundException('Tenant not found');
    }

    await this.em.removeAndFlush(entity);

    this.logger.log(`Deleted tenant ${entity.name} (${entity.id})`);
  }

  public async confirmTenantOperator(tenantIdOrName: string, operatorIdOrName: string): Promise<ViewOperatorTenantDTO> {
    if (!(await this.userContext.isTenantAdmin(tenantIdOrName)) && !this.userContext.isSuperuser()) {
      throw new ForbiddenException('You are not allowed to perform this actions');
    }

    const tenantOperator = await this.em.findOne(
      OperatorTenantEntity,
      {
        tenant: uuid.validate(tenantIdOrName)
          ? {
              id: tenantIdOrName
            }
          : {
              name: tenantIdOrName
            },
        operator: uuid.validate(operatorIdOrName)
          ? {
              id: operatorIdOrName
            }
          : {
              name: operatorIdOrName
            }
      },
      {
        populate: ['tenant', 'operator']
      }
    );

    if (!tenantOperator) {
      throw new NotFoundException('Operator request not found');
    }

    if (tenantOperator.status === OperatorTenantStatus.Active) {
      throw new BadRequestException('Operator request already confirmed');
    }

    this.em.assign(tenantOperator, { status: OperatorTenantStatus.Active });

    this.logger.log(
      `User ${this.userContext.userId} confirmed operator request from operator ${tenantOperator.operator.name} (${tenantOperator.operator.id}) for tenant ${tenantOperator.tenant.name} (${tenantOperator.tenant.id})`
    );

    await this.em.persistAndFlush(tenantOperator);

    // TODO: Notify operator of request confirmation

    return {
      tenant: this.tenantEntityToDTO(tenantOperator.tenant),
      operator: {
        id: tenantOperator.operator.id,
        name: tenantOperator.operator.name,
        displayName: tenantOperator.operator.displayName,
        createdAt: tenantOperator.operator.createdAt.toISOString(),
        updatedAt: tenantOperator.operator.updatedAt.toISOString()
      },
      status: tenantOperator.status,
      createdAt: tenantOperator.createdAt,
      updatedAt: tenantOperator.updatedAt
    };
  }

  public async removeTenantOperator(tenantIdOrName: string, operatorIdOrName: string) {
    if (!(await this.userContext.isTenantAdmin(tenantIdOrName)) && !this.userContext.isSuperuser()) {
      throw new ForbiddenException(`You are not authorized to perform this action`);
    }

    const operatorTenant = await this.em.findOne(
      OperatorTenantEntity,
      {
        operator: uuid.validate(operatorIdOrName)
          ? {
              id: operatorIdOrName
            }
          : {
              name: operatorIdOrName
            },
        tenant: uuid.validate(tenantIdOrName)
          ? {
              id: tenantIdOrName
            }
          : {
              name: tenantIdOrName
            }
      },
      { populate: ['operator', 'tenant'] }
    );

    if (!operatorTenant) {
      throw new NotFoundException(`Tenant is not in a relationship with this operator`);
    }

    await this.em.removeAndFlush(operatorTenant);

    this.logger.log(
      `User ${this.userContext.userId} terminated relationship between tenant ${operatorTenant.tenant.name} (${operatorTenant.tenant.id}) and operator ${operatorTenant.operator.name} (${operatorTenant.operator.id})`
    );

    // TODO: Notify of termination
  }

  private tenantEntityToDTO(entity: TenantEntity): ViewTenantDTO {
    return {
      id: entity.id,
      displayName: entity.displayName,
      name: entity.name,
      scopes: entity.scopes.toArray().map((scope) => ({
        id: scope.id,
        name: scope.name,
        color: scope.color,
        createdAt: scope.createdAt,
        updatedAt: scope.updatedAt
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}

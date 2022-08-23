import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EntityDTO } from '@mikro-orm/core';
import { EntityManager, QueryBuilder } from '@mikro-orm/postgresql';
import { PaginatedList } from '@nestjs-snerpa/common';
import * as uuid from 'uuid';

import { UserContext } from '../shared/user.context';
import { OperatorUserEntity } from './operator-user.entity';
import { OperatorEntity } from './operator.entity';
import {
  CreateOperatorDTO,
  OperatorRole,
  OperatorTenantStatus,
  UpdateOperatorDTO,
  ViewOperatorDTO,
  ViewOperatorTenantDTO,
  ViewOperatorUserDTO
} from '@vidvera/core';
import { UserEntity } from '../users/user.entity';
import { TenantEntity } from '../tenants/tenant.entity';
import { OperatorTenantEntity } from './operator-tenant.entity';

@Injectable()
export class OperatorService {
  private logger = new Logger(OperatorService.name);

  constructor(private em: EntityManager, private userContext: UserContext) {}

  async queryOperators(query?: string, options?: { page?: number; size?: number }): Promise<PaginatedList<ViewOperatorDTO>> {
    const page = options?.page ?? 0;
    const size = options?.size ?? 25;
    const qb = this.em
      .createQueryBuilder(OperatorEntity)
      .limit(size)
      .offset(size * page);

    if (query) {
      qb.where((qb: QueryBuilder<OperatorEntity>) =>
        qb
          .orWhere({
            name: { $ilike: `%${query}%` }
          })
          .orWhere({
            displayName: { $ilike: `%${query}%` }
          })
      );
    }

    const results = await qb.getResult();

    return {
      page,
      size,
      total: await qb.getCount(),
      items: results.map((entity) => this.operatorEntityToDTO(entity.toObject()))
    };
  }

  async createOperator(data: CreateOperatorDTO) {
    const exists = await this.em.findOne(OperatorEntity, { name: data.name });

    if (exists) {
      throw new ConflictException(`Operator with name ${data.name} already exists`);
    }

    const entity = this.em.create(OperatorEntity, new OperatorEntity(data.name, data.displayName));

    await this.em.persistAndFlush(entity);

    this.logger.log(`Operator ${entity.name} (${entity.id}) created by ${this.userContext.userId}`);

    return this.operatorEntityToDTO(entity.toObject());
  }

  async fetchOperator(operatorIdOrName: string): Promise<ViewOperatorDTO> {
    const operator = await this.em.findOne(
      OperatorEntity,
      uuid.validate(operatorIdOrName)
        ? {
            id: operatorIdOrName
          }
        : {
            name: operatorIdOrName
          },
      { populate: ['tenants', 'users'] }
    );

    if (!operator) {
      throw new NotFoundException(`Operator with id ${operatorIdOrName} not found`);
    }

    if (!(await this.userContext.isOperatorMember(operatorIdOrName)) && !this.userContext.isSuperuser()) {
      throw new ForbiddenException(`You are not authorized to view this operator`);
    }

    return this.operatorEntityToDTO(operator.toObject());
  }

  async updateOperator(operatorIdOrName: string, data: UpdateOperatorDTO): Promise<ViewOperatorDTO> {
    const operator = await this.em.findOne(
      OperatorEntity,
      uuid.validate(operatorIdOrName)
        ? {
            id: operatorIdOrName
          }
        : {
            name: operatorIdOrName
          }
    );

    if (!operator) {
      throw new NotFoundException(`Operator with id ${operatorIdOrName} not found`);
    }

    if (!(await this.userContext.isOperatorAdmin(operatorIdOrName))) {
      throw new ForbiddenException(`You are not authorized to update this operator`);
    }

    this.em.assign(operator, data);

    await this.em.persistAndFlush(operator);

    this.logger.log(`Operator ${operator.name} (${operator.id}) updated by ${this.userContext.userId}`);

    return this.operatorEntityToDTO(operator.toObject());
  }

  async deleteOperator(operatorIdOrName: string): Promise<void> {
    const operator = await this.em.findOne(
      OperatorEntity,
      uuid.validate(operatorIdOrName)
        ? {
            id: operatorIdOrName
          }
        : {
            name: operatorIdOrName
          }
    );

    if (!operator) {
      throw new NotFoundException(`Operator with id ${operatorIdOrName} not found`);
    }

    this.logger.log(`Operator ${operator.name} (${operator.id}) deleted by ${this.userContext.userId}`);

    await this.em.removeAndFlush(operator);
  }

  async addOperatorUser(operatorIdOrName: string, userId: string, role: OperatorRole = OperatorRole.User) {
    const operator = await this.em.findOne(
      OperatorEntity,
      uuid.validate(operatorIdOrName)
        ? {
            id: operatorIdOrName
          }
        : {
            name: operatorIdOrName
          }
    );

    if (!operator) {
      throw new NotFoundException(`Operator with id ${operatorIdOrName} not found`);
    }

    if (!(await this.userContext.isOperatorAdmin(operatorIdOrName))) {
      throw new ForbiddenException(`You are not authorized to add users to this operator`);
    }

    const user = await this.em.findOne(UserEntity, userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} doesn't exist`);
    }

    const operatorUser = await this.em.findOne(OperatorUserEntity, {
      user: user,
      operator: operator
    });

    if (operatorUser) {
      throw new ConflictException(`User ${userId} is already a member of this operator`);
    }

    const entity = this.em.create(OperatorUserEntity, new OperatorUserEntity(user, operator, role));

    this.logger.log(`User ${userId} added to operator ${operator.name} (${operator.id}) by ${this.userContext.userId}`);

    await this.em.persistAndFlush(entity);
  }

  async createOperatorTenantRequest(
    operatorIdOrName: string,
    tenantIdOrName: string,
    status: OperatorTenantStatus = OperatorTenantStatus.Pending
  ) {
    const operator = await this.em.findOne(
      OperatorEntity,
      uuid.validate(operatorIdOrName)
        ? {
            id: operatorIdOrName
          }
        : {
            name: operatorIdOrName
          }
    );

    if (!operator) {
      throw new NotFoundException(`Operator with name or id ${operatorIdOrName} not found`);
    }

    if (!(await this.userContext.isOperatorAdmin(operatorIdOrName))) {
      throw new ForbiddenException(`You are not authorized to perform this action`);
    }

    const tenant = await this.em.findOne(
      TenantEntity,
      uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    );

    if (!tenant) {
      throw new NotFoundException(`Tenant with name or id ${tenantIdOrName} not found`);
    }

    const operatorTenant = await this.em.findOne(OperatorTenantEntity, {
      operator: operator,
      tenant: tenant
    });

    if (operatorTenant) {
      throw new ConflictException(`Tenant is already in a relationship with this operator`);
    }

    const entity = this.em.create(
      OperatorTenantEntity,
      new OperatorTenantEntity(tenant, operator, this.userContext.isSuperuser() ? status : OperatorTenantStatus.Pending)
    );

    await this.em.persistAndFlush(entity);

    this.logger.log(
      `User ${this.userContext.userId} requested access on behalf of operator ${operator.name} (${operator.id}) to tenant ${tenant.name} (${tenant.id})`
    );

    // TODO: Notify tenant of request

    return this.operatorTenantEntityToDTO(entity.toObject());
  }

  public async removeOperatorTenant(operatorIdOrName: string, tenantIdOrName: string) {
    if (!(await this.userContext.isOperatorAdmin(operatorIdOrName))) {
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
      throw new NotFoundException(`Operator is not in a relationship with this tenant`);
    }

    await this.em.removeAndFlush(operatorTenant);

    this.logger.log(
      `User ${this.userContext.userId} terminated relationship between operator ${operatorTenant.operator.name} (${operatorTenant.operator.id}) and tenant ${operatorTenant.tenant.name} (${operatorTenant.tenant.id})`
    );

    // TODO: Notify of termination
  }

  private operatorEntityToDTO(operator: EntityDTO<OperatorEntity>): ViewOperatorDTO {
    return {
      id: operator.id,
      name: operator.name,
      displayName: operator.displayName,
      users: operator.users.map((user) => this.operatorUserEntityToDTO(user)),
      createdAt: operator.createdAt.toISOString(),
      updatedAt: operator.updatedAt.toISOString()
    };
  }

  private operatorUserEntityToDTO(entity: EntityDTO<OperatorUserEntity>): ViewOperatorUserDTO {
    return {
      id: entity.user.id,
      name: entity.user.name,
      email: entity.user.email,
      operator: entity.operator ? this.operatorEntityToDTO(entity.operator) : undefined,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private operatorTenantEntityToDTO(entity: EntityDTO<OperatorTenantEntity>): ViewOperatorTenantDTO {
    return {
      operator: this.operatorEntityToDTO(entity.operator),
      tenant: {
        id: entity.tenant.id,
        name: entity.tenant.name,
        displayName: entity.tenant.displayName,
        createdAt: entity.tenant.createdAt,
        updatedAt: entity.tenant.updatedAt
      },
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}

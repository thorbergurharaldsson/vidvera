import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, Scope } from '@nestjs/common';
import { TenantEntity } from '../tenants/tenant.entity';
import { ScopeEntity } from './scope.entity';
import { UserContext } from '../shared/user.context';
import { CreateScopeDTO, ViewScopeDTO, UpdateScopeDTO } from '@vidvera/core';

@Injectable({ scope: Scope.REQUEST })
export class ScopesService {
  logger = new Logger(ScopesService.name);

  constructor(private em: EntityManager, private userContext: UserContext) {}

  /**
   * Create a new scope
   * @param scope Scope to create
   * @returns Created scope
   * @throws {HttpStatus.CONFLICT} If scope with the same name already exists
   * @throws {HttpStatus.CONFLICT} If scope with the same color already exists
   */
  public async createScope(tenantId: string, scope: CreateScopeDTO): Promise<ViewScopeDTO> {
    const tenant = await this.em.findOne(TenantEntity, { id: tenantId });

    if (!tenant || !(await this.userContext.isTenantMember(tenantId))) {
      throw new BadRequestException('Tenant not found');
    }

    if (!this.userContext.isSuperuser() && !(await this.userContext.isTenantAdmin(tenantId))) {
      throw new ForbiddenException('You are not allowed to create scopes');
    }

    if (await this.em.findOne(ScopeEntity, { name: { $ilike: `${scope.name}` } })) {
      throw new ConflictException('Scope with the same name already exists');
    }

    if (await this.em.findOne(ScopeEntity, { color: scope.color })) {
      throw new ConflictException('Scope with the same color already exists');
    }

    const entity = this.em.create(ScopeEntity, new ScopeEntity(scope.name, scope.color, tenant));

    await this.em.persistAndFlush(entity);

    this.logger.log(`Created scope ${entity.name}(${entity.id}) on tenant ${tenant.name}`);

    return this.scopeEntityToDTO(entity);
  }

  public async fetchScopes(tenantId: string, filters?: { name?: string }, pagination?: { page?: number; size?: number }) {
    const page = pagination?.page ?? 0;
    const size = pagination?.size ?? 25;
    const query = this.em.createQueryBuilder(ScopeEntity, 'scope');

    if (!(await this.userContext.isTenantMember(tenantId))) {
      return {
        page,
        size,
        total: 0,
        items: []
      };
    }

    query.andWhere({
      tenant: tenantId
    });

    if (filters?.name) {
      query.andWhere({ name: { $ilike: `%${filters.name}%` } });
    }

    query.limit(size);
    query.offset(size * page);

    return {
      page,
      size,
      total: await query.getCount(),
      items: (await query.leftJoinAndSelect('users', 'users').getResult()).map(this.scopeEntityToDTO)
    };
  }

  public async fetchTenantScope(tenantId: string, scopeId: number) {
    const entity = await this.em.findOne(ScopeEntity, { id: scopeId, tenant: tenantId });

    if (!entity || !(await this.userContext.isTenantMember(tenantId))) {
      throw new NotFoundException('Scope not found');
    }

    return this.scopeEntityToDTO(entity);
  }

  /**
   * Update a scope
   * @param scope Scope to update
   * @returns Updated scope
   * @throws {HttpStatus.CONFLICT} If scope with the same name already exists
   * @throws {HttpStatus.CONFLICT} If scope with the same color already exists
   */
  public async updateTenantScope(tenantId: string, scopeId: number, scope: UpdateScopeDTO): Promise<ViewScopeDTO> {
    const entity = await this.em.findOne(
      ScopeEntity,
      {
        id: scopeId,
        tenant: tenantId
      },
      { populate: ['tenant'] }
    );

    if (!entity || !(await this.userContext.isTenantMember(tenantId))) {
      throw new NotFoundException('Scope not found');
    }

    if (!(await this.userContext.isTenantAdmin(tenantId)) && !this.userContext.isSuperuser()) {
      throw new ForbiddenException('You are not allowed to update scopes');
    }

    if (entity.name !== scope.name && (await this.em.findOne(ScopeEntity, { name: scope.name }))) {
      throw new ConflictException('Scope with the same name already exists');
    }

    if (entity.color !== scope.color && (await this.em.findOne(ScopeEntity, { color: scope.color }))) {
      throw new ConflictException('Scope with the same color already exists');
    }

    this.em.assign(entity, scope);
    await this.em.persistAndFlush(entity);

    this.logger.log(`Updated scope ${entity.name}(${entity.id}) on tenant ${entity.tenant.name}`);

    return this.scopeEntityToDTO(entity);
  }

  /**
   * Delete a scope
   * @param id Scope id
   * @throws {NotFoundException} If scope not found
   */
  public async deleteTenantScope(tenantId: string, scopeId: number): Promise<void> {
    const entity = await this.em.findOne(
      ScopeEntity,
      {
        id: scopeId,
        tenant: tenantId
      },
      { populate: ['tenant'] }
    );

    if (!entity || !(await this.userContext.isTenantMember(tenantId))) {
      throw new NotFoundException('Scope not found');
    }

    if (!(await this.userContext.isTenantAdmin(tenantId)) && !this.userContext.isSuperuser()) {
      throw new ForbiddenException('You are not allowed to delete scopes');
    }

    await this.em.removeAndFlush(entity);

    this.logger.log(`Deleted scope ${entity.name}(${entity.id}) on tenant ${entity.tenant.name}`);
  }

  private scopeEntityToDTO(entity: ScopeEntity): ViewScopeDTO {
    return {
      id: entity.id,
      name: entity.name,
      color: entity.color,
      users: entity.users.toArray().map((user) => ({
        id: user.user.id,
        name: user.user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}

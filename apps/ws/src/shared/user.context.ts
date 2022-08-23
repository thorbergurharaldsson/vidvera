import { EntityManager } from '@mikro-orm/postgresql';
import { KeycloakAuthenticationContext } from '@nestjs-snerpa/keycloak';
import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';

import { AppRole, OperatorRole, OperatorTenantStatus, TenantRole } from '@vidvera/shared';
import { OperatorTenantEntity } from '../operators/operator-tenant.entity';
import { OperatorUserEntity } from '../operators/operator-user.entity';
import { TenantUserEntity } from '../users/tenant-user.entity';

@Injectable()
export class UserContext {
  constructor(private authContext: KeycloakAuthenticationContext, private em: EntityManager) {}

  get token() {
    return this.authContext.token;
  }

  /**
   * Authenticated users ID
   */
  get userId() {
    return this.authContext.user.sub;
  }

  /**
   * Get the authenticated user claims
   */
  get user() {
    return this.authContext.user;
  }

  /**
   * Checks if the current request is authenticated
   */
  get isAuthenticated() {
    return this.authContext.isAuthenticated;
  }

  /**
   * Checks if the given user id is the same as the authenticated user id.
   *
   * @param userId User id to match
   * @returns true if id matches
   */
  isAuthenticatedUser(userId: string) {
    return this.userId === userId;
  }

  async isAuthenticatedTenantUser(tenantUserId: string) {
    const user = await this.em.findOne(TenantUserEntity, { user: this.userId });

    return user && user.id === tenantUserId;
  }

  /**
   * Checks if the authenticated user is a superuser
   *
   * @returns true if user is superuser
   */
  isSuperuser() {
    return this.authContext.isAuthenticated && this.authContext.hasRole(AppRole.Superuser);
  }

  /**
   * Checks if the authenticated user has the given role for the given tenant.
   *
   * @param tenantIdOrName ID or name of the tenant to check
   * @param role The role to check
   * @returns true if the user has the role
   */
  async hasTenantRole(tenantIdOrName: string, role: TenantRole) {
    const user = await this.em.findOne(TenantUserEntity, {
      user: this.userId,
      tenant: uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          },
      role
    });

    return user ? true : false;
  }

  /**
   * Checks if the authenticated user is a member of the given tenant.
   *
   * @param tenantIdOrName The tenant to check
   * @returns true if the user is a member of the tenant
   */
  async isTenantMember(tenantIdOrName: string): Promise<boolean> {
    const user = await this.em.findOne(TenantUserEntity, {
      user: this.authContext.user.sub,
      tenant: uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    });

    return user ? true : false;
  }

  /**
   * Checks if the authenticated user is a manager of the given tenant.
   *
   * @param tenantId The tenant to check
   * @returns True if the user is a manager of the tenant
   */
  async isTenantAdmin(tenantId: string): Promise<boolean> {
    return this.isSuperuser() || this.hasTenantRole(tenantId, TenantRole.Admin);
  }

  async isOperatorMember(operatorNameOrId: string): Promise<boolean> {
    const user = await this.em.findOne(OperatorUserEntity, {
      user: this.authContext.user.sub,
      operator: uuid.validate(operatorNameOrId)
        ? {
            id: operatorNameOrId
          }
        : {
            name: operatorNameOrId
          }
    });

    return user ? true : false;
  }

  /**
   * Checks if the authenticated user is an operator admin
   *
   * @param operatorNameOrId Id or name of the operator
   * @returns
   */
  async isOperatorAdmin(operatorNameOrId: string): Promise<boolean> {
    return this.isSuperuser() || this.hasOperatorRole(operatorNameOrId, OperatorRole.Admin);
  }

  async isTenantOperator(tenantIdOrName: string) {
    const result = await this.em.findOne(OperatorTenantEntity, {
      status: OperatorTenantStatus.Active,
      operator: {
        users: {
          user: this.userId
        }
      },
      tenant: uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    });

    return result ? true : false;
  }

  /**
   * Checks if the authenticated user has the given role for the given operator.
   *
   * @param operatorNameOrId ID or name of the operator
   * @param role The role to check
   * @returns true if the user has the role
   */
  async hasOperatorRole(operatorNameOrId: string, role: OperatorRole) {
    const user = await this.em.findOne(OperatorUserEntity, {
      user: this.userId,
      operator: uuid.validate(operatorNameOrId)
        ? {
            id: operatorNameOrId
          }
        : {
            name: operatorNameOrId
          },
      role
    });

    return user ? true : false;
  }

  async hasTenantAccess(tenantNameOrId: string): Promise<boolean> {
    return this.isSuperuser() || (await this.isTenantMember(tenantNameOrId)) || (await this.isTenantOperator(tenantNameOrId));
  }
}

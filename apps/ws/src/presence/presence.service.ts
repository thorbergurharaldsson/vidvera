import { EntityDTO } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ForbiddenException, Injectable, Logger, NotFoundException, NotImplementedException } from '@nestjs/common';
import { DateTime } from 'luxon';

import { CreatePresenceSessionDTO, SetUserPresenceDTO, UserAvailability, ViewPresenceDTO } from '@vidvera/core';
import { UserContext } from '../shared/user.context';

import { PresenceSessionEntity } from './presence-session.entity';
import { TenantUserEntity } from '../users/tenant-user.entity';
import { TenantUserPresenceEntity } from './tenant-user-presence.entity';

@Injectable()
export class PresenceService {
  private logger = new Logger(PresenceService.name);

  constructor(private em: EntityManager, private userContext: UserContext) {}

  async setUserPresence(tenantUserId: string, presence: SetUserPresenceDTO): Promise<ViewPresenceDTO> {
    const user = await this.em.findOne(TenantUserEntity, { id: tenantUserId }, { populate: ['tenant'] });

    if (!user) {
      throw new NotFoundException(`Tenant user with id ${tenantUserId} not found`);
    }

    if (!this.userContext.isTenantAdmin(user.tenant.id) && !this.userContext.isAuthenticatedTenantUser(tenantUserId)) {
      throw new ForbiddenException('You are not allowed to set user presence for this user');
    }

    let presenceEntity = await this.em.findOne(TenantUserPresenceEntity, { user });

    if (!presenceEntity) {
      presenceEntity = this.em.create(
        TenantUserPresenceEntity,
        new TenantUserPresenceEntity(
          user,
          presence.availability,
          DateTime.local().plus({ second: presence.expiresAfterSec }).toJSDate(),
          presence.message
        )
      );
    } else {
      this.em.assign(presenceEntity, {
        availability: presence.availability,
        message: presence.message,
        expiresAt: DateTime.local().plus({ second: presence.expiresAfterSec }).toJSDate()
      });
    }

    await this.em.persistAndFlush(presenceEntity);

    this.logger.log(`Presence for user ${tenantUserId} set to ${presenceEntity.availability}`);

    return this.getUserPresence(user.tenant.id, user.id);
  }

  async clearUserPresence(tenantUserId: string): Promise<ViewPresenceDTO> {
    const tenantUser = await this.em.findOne(TenantUserEntity, {}, { populate: ['presence'] });

    if (!tenantUser) {
      throw new NotFoundException(`Tenant user with id ${tenantUserId} not found`);
    }

    if (!this.userContext.isTenantAdmin(tenantUser.tenant.id) && !this.userContext.isAuthenticatedUser(tenantUserId)) {
      throw new ForbiddenException('You are not allowed to clear user presence for this user');
    }

    if (tenantUser.presence) {
      await this.em.removeAndFlush(tenantUser.presence);
    }

    return this.getUserPresence(tenantUser.tenant.id, tenantUser.id);
  }

  async createPresenceSession(tenantId: string, userId: string, data: CreatePresenceSessionDTO) {
    const user = await this.em.findOne(TenantUserEntity, { user: userId, tenant: tenantId });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found in tenant ${tenantId}`);
    }

    const status = this.em.create(
      PresenceSessionEntity,
      new PresenceSessionEntity(user, data.availability, new Date(data.expiresAfterSec), data.activity, data.message)
    );

    await this.em.persistAndFlush(status);

    this.logger.log(`Presence session started for user ${userId} with availability ${status.availability}`);
  }

  async refreshPresenceSession(sessionId: string, expiresAfterSec: number) {
    const session = await this.em.findOne(PresenceSessionEntity, { id: sessionId });

    if (!session) {
      throw new NotFoundException(`Presence session with id ${sessionId} not found`);
    }

    this.em.assign(session, { expiresAt: DateTime.local().plus({ seconds: expiresAfterSec }).toJSDate() });

    await this.em.persistAndFlush(session);
  }

  async getUserPresence(tenantId: string, tenantUserId: string): Promise<ViewPresenceDTO> {
    if (!this.userContext.hasTenantAccess(tenantId)) {
      throw new ForbiddenException('You are not allowed to get user presence for this tenant');
    }

    const user = await this.em.findOne(
      TenantUserEntity,
      { user: tenantUserId, tenant: tenantId },
      { populate: ['presenceSessions', 'tenant', 'presence'] }
    );

    if (!user) {
      throw new NotFoundException(`User with id ${tenantUserId} not found`);
    }

    return this.aggregatePresenceSessions(user.toPOJO());
  }

  /**
   * Aggregate presence sessions for user into a single status
   *
   * Priority is as follows:
   * User-configured > Tenant-configured > app-configured
   *
   * Priority for App-configured presence is as follows:
   * Do not disturb > Busy > Available > Away
   *
   * If user doesn't have a active presence session it defaults to Available
   *
   * @param sessions A list of presence sessions for user
   * @returns A single status for user
   */
  aggregatePresenceSessions(entity: EntityDTO<TenantUserEntity>): ViewPresenceDTO {
    /**
     * Priority is as follows:
     * User-configured > Tenant-configured > app-configured
     */

    if (entity.presence) {
      return {
        availability: entity.presence.availability,
        message: entity.presence.message,
        expiresAt: entity.presence.expiresAt?.toISOString()
      };
    }

    if (entity.presenceSessions.length === 0) {
      return {
        availability: UserAvailability.Available
      };
    }

    // Until support for external clients is implemented only user configured presence is supported
    if (entity.presenceSessions.length > 1) {
      throw new NotImplementedException('MULTIPLE_SESSIONS_NOT_YET_SUPPORTED');
    }

    const aggregatedPresence = entity.presenceSessions
      .filter((s) => s.expiresAt && s.expiresAt > new Date())
      .reduce((prev, curr) => {
        if (curr.availability === UserAvailability.DoNotDisturb) {
          return curr;
        }

        if (curr.availability === UserAvailability.Busy || curr.availability === UserAvailability.BusyIdle) {
          return curr;
        }

        if (prev) {
          return prev;
        }

        if (curr.availability === UserAvailability.Available || curr.availability === UserAvailability.AvailableIdle) {
          return curr;
        }

        if (curr.availability === UserAvailability.Away) {
          return curr;
        }

        return curr;
      });

    if (!aggregatedPresence) {
      return {
        availability: UserAvailability.Available
      };
    }

    return {
      availability: aggregatedPresence.availability,
      activity: aggregatedPresence.activity,
      message: aggregatedPresence.message,
      expiresAt: aggregatedPresence.expiresAt?.toISOString()
    };
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EntityManager } from '@mikro-orm/postgresql';

import * as uuid from 'uuid';
import Nodemailer from 'nodemailer';
import { DateTime } from 'luxon';

import { TenantEntity } from '../tenants/tenant.entity';
import { TenantUserEntity } from './tenant-user.entity';
import { UserEntity } from './user.entity';
import { TenantInviteEntity } from '../tenants/tenant-invite.entity';
import { UserContext } from '../shared/user.context';
import { ScopeEntity } from '../scopes/scope.entity';
import {
  AcceptTenantInviteDTO,
  CreateTenantInviteDTO,
  SetUserPresenceDTO,
  TenantRole,
  UpdateTenantUserDTO,
  UserAvailability,
  ViewPresenceDTO,
  ViewTenantInviteDTO,
  ViewTenantUserDTO
} from '@vidvera/core';
import { PresenceService } from '../presence/presence.service';

@Injectable()
export class TenantUsersService {
  logger = new Logger(TenantUsersService.name);

  constructor(
    private em: EntityManager,
    private userContext: UserContext,
    private configService: ConfigService,
    private presenceService: PresenceService
  ) {}

  /**
   * Create a new user
   * @param data User to create
   * @returns Created user
   */
  public async createTenantInvite(tenantId: string, data: CreateTenantInviteDTO): Promise<ViewTenantInviteDTO> {
    const tenant = await this.em.findOne(TenantEntity, { id: tenantId });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!(await this.userContext.isTenantAdmin(tenantId))) {
      throw new ForbiddenException('You are not allowed to invite users to this tenant');
    }

    const inviteEntity = this.em.create(
      TenantInviteEntity,
      new TenantInviteEntity(data.email, tenant, DateTime.local().plus({ hours: 4 }).toJSDate())
    );

    await this.em.persistAndFlush([inviteEntity]);

    this.logger.log(`Invite created for ${data.email} to tenant ${tenant.name}`);

    return this.sendTenantInvite(inviteEntity.id);
  }

  /**
   * Emails a tenant invite to the user
   * @param id
   */
  public async sendTenantInvite(id: string): Promise<ViewTenantInviteDTO> {
    const invite = await this.em.findOne(TenantInviteEntity, { id }, { populate: ['tenant'] });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.expiresAt < DateTime.local().toJSDate()) {
      throw new ConflictException('Invite has expired');
    }

    this.em.assign(invite, {
      inviteSentAt: new Date()
    });

    await this.em.persistAndFlush(invite);

    const transport = Nodemailer.createTransport({
      port: this.configService.get('mail.port'),
      host: this.configService.get('mail.host'),
      secure: this.configService.get('mail.secure'),
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.password')
      }
    });

    const isTransportValid = await transport.verify();

    if (!isTransportValid) {
      throw new InternalServerErrorException('Email configuration invalid');
    }

    const replyTo = this.configService.get('mail.replyTo');

    const replyToName = this.configService.get('mail.replyToName');

    const url = new URL(`/${invite.tenant.name}/invite/${invite.id}/accept`, this.configService.get('app.frontendUrl'));

    const message = await transport.sendMail({
      to: invite.email,
      from: this.configService.get('mail.from'),
      replyTo: replyTo && replyToName ? { address: replyTo, name: replyToName } : replyTo,
      subject: 'Viðvera - Invite to join tenant',
      text: `You have been invited to join the tenant ${invite.tenant.name} on Viðvera. Click the link below to accept the invite. ${url}`,
      html: `<p>You have been invited to join the tenant ${invite.tenant.name} on Viðvera. Click the link below to accept the invite.</p> <p><a href="${url}">Accept invite</a></p>`
    });

    this.logger.log(`Email sent to ${invite.email} with id ${message.messageId} response ${message.response}`);

    return {
      id: invite.id,
      email: invite.email,
      inviteSentAt: invite.inviteSentAt,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt
    };
  }

  /**
   * Accept a previously created tenant invite
   *
   * @param id The id of the invite
   * @returns The new tenant user
   */
  public async acceptTenantInvite(tenantNameOrId: string, inviteId: string, data: AcceptTenantInviteDTO): Promise<ViewTenantUserDTO> {
    if (!this.userContext.isAuthenticated) {
      throw new UnauthorizedException('You must be logged in to accept an invite');
    }

    const invite = await this.em.findOne(
      TenantInviteEntity,
      { tenant: uuid.validate(tenantNameOrId) ? tenantNameOrId : { name: tenantNameOrId }, id: inviteId },
      { populate: ['tenant'] }
    );

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.expiresAt < DateTime.local().toJSDate()) {
      throw new ConflictException('Invite has expired');
    }

    const user = await this.em.findOne(UserEntity, { id: this.userContext.userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tenantUser = this.em.create(
      TenantUserEntity,
      new TenantUserEntity(
        invite.tenant,
        user,
        TenantRole.User,
        data.workPhone,
        data.isWorkPhonePrivate,
        data.mobilePhone,
        data.isMobilePhonePrivate,
        data.jobTitle,
        data.email
      )
    );

    this.em.assign(invite, {
      acceptedAt: new Date()
    });

    await this.em.persistAndFlush([tenantUser, invite]);

    this.logger.log(`User ${user.email} accepted invite to tenant ${invite.tenant.name}`);

    return this.userEntityToDTO(tenantUser);
  }

  async getTenantInvites(tenantId: string): Promise<ViewTenantInviteDTO[]> {
    if (!this.userContext.isTenantAdmin(tenantId)) {
      throw new ForbiddenException('You are not allowed to view invites');
    }

    const entities = await this.em.find(TenantInviteEntity, { tenant: { id: tenantId } });

    return entities.map((entity) => this.inviteEntityToDTO(entity));
  }

  async getTenantInvite(tenantNameOrId: string, inviteId: string): Promise<ViewTenantInviteDTO> {
    const entity = await this.em.findOne(TenantInviteEntity, {
      tenant: uuid.validate(tenantNameOrId) ? { id: tenantNameOrId } : { name: tenantNameOrId },
      id: inviteId
    });

    if (!entity) {
      throw new NotFoundException('Invite not found');
    }

    return this.inviteEntityToDTO(entity);
  }

  async deleteTenantInvite(tenantId: string, inviteId: string): Promise<void> {
    if (!this.userContext.isTenantAdmin(tenantId)) {
      throw new ForbiddenException('You are not allowed to delete invites');
    }

    const entity = await this.em.findOne(TenantInviteEntity, { tenant: { id: tenantId }, id: inviteId });

    if (!entity) {
      throw new NotFoundException('Invite not found');
    }

    await this.em.removeAndFlush(entity);
  }

  public async queryTenantUsers(
    tenantIdOrName: string,
    query?: string,
    filters?: { scopes?: number[] | number },
    options?: { page?: number; size?: number }
  ) {
    if (!(await this.userContext.hasTenantAccess(tenantIdOrName))) {
      throw new ForbiddenException('You are not allowed to query tenant users');
    }

    const page = options?.page ?? 0;
    const size = options?.size ?? 25;
    const qb = this.em.createQueryBuilder(TenantUserEntity);

    qb.andWhere({
      tenant: uuid.validate(tenantIdOrName)
        ? {
            id: tenantIdOrName
          }
        : {
            name: tenantIdOrName
          }
    });

    if (filters?.scopes) {
      qb.andWhere({ scopes: { $in: Array.isArray(filters.scopes) ? filters.scopes : [filters.scopes] } });
    }

    if (query) {
      qb.andWhere({
        $or: [
          {
            mobilePhone: {
              $ilike: `%${query}%`
            }
          },
          {
            workPhone: {
              $ilike: `%${query}%`
            }
          },
          {
            email: {
              $ilike: `%${query}%`
            }
          },
          {
            jobTitle: {
              $ilike: `%${query}%`
            }
          },
          {
            user: {
              name: {
                $ilike: `%${query}%`
              }
            }
          },
          {
            user: {
              email: {
                $ilike: `%${query}%`
              }
            }
          }
        ]
      });
    }

    qb.limit(size);
    qb.offset(size * page);

    const items = await qb
      .leftJoinAndSelect('tenant', 'tenant')
      .leftJoinAndSelect('user', 'user')
      .leftJoinAndSelect('scopes', 'scopes')
      .leftJoinAndSelect('presence', 'presence')
      .leftJoinAndSelect('presenceSessions', 'presenceSessions')
      .getResult();

    return {
      page,
      size,
      total: await qb.getCount(),
      items: items.map((user) => this.userEntityToDTO(user, this.presenceService.aggregatePresenceSessions(user.toPOJO())))
    };
  }

  public async updateTenantUser(tenantId: string, userId: string, data: UpdateTenantUserDTO): Promise<ViewTenantUserDTO> {
    const tenantUser = await this.em.findOne(TenantUserEntity, { tenant: tenantId, user: userId }, { populate: ['tenant', 'scopes'] });

    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    if (this.userContext.isAuthenticatedUser(userId) || !(await this.userContext.isTenantAdmin(tenantId))) {
      throw new ForbiddenException('You are not allowed to update users in this tenant');
    }

    if (data.scopes) {
      const scopes = await this.em.find(ScopeEntity, { id: data.scopes });

      tenantUser.scopes.set(scopes);
    }

    this.em.assign(tenantUser, data);

    await this.em.persistAndFlush(tenantUser);

    this.logger.log(`User ${userId} updated in tenant ${tenantId}`);

    return this.userEntityToDTO(tenantUser);
  }

  public async fetchTenantUser(tenantId: string, userId: string) {
    const tenantUser = await this.em.findOne(TenantUserEntity, { tenant: tenantId, user: userId }, { populate: ['tenant', 'scopes'] });

    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    return this.userEntityToDTO(tenantUser, await this.presenceService.getUserPresence(tenantId, userId));
  }

  /**
   * Removes a tenant user
   *
   * @param id
   */
  public async removeTenantUser(tenantId: string, userId: string) {
    const tenantUser = await this.em.findOne(TenantUserEntity, { tenant: tenantId, user: userId });

    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    if (!(await this.userContext.isTenantAdmin(tenantUser.tenant.id))) {
      throw new ForbiddenException('You are not allowed to remove users from this tenant');
    }

    this.logger.log(`User ${userId} removed from tenant ${tenantId}`);

    await this.em.removeAndFlush(tenantUser);
  }

  public async setUserPresence(tenantId: string, userId: string, presence: SetUserPresenceDTO): Promise<ViewPresenceDTO> {
    const tenantUser = await this.em.findOne(TenantUserEntity, { tenant: tenantId, user: userId });

    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    if (!(await this.userContext.isAuthenticatedUser(userId)) && !(await this.userContext.isTenantAdmin(tenantId))) {
      throw new ForbiddenException('You are not allowed to change this users presence');
    }

    return this.presenceService.setUserPresence(tenantUser.id, presence);
  }

  public async clearUserPresence(tenantId: string, userId: string): Promise<ViewPresenceDTO> {
    const tenantUser = await this.em.findOne(TenantUserEntity, { tenant: tenantId, user: userId });

    if (!tenantUser) {
      throw new NotFoundException('Tenant user not found');
    }

    if (this.userContext.isAuthenticatedUser(userId) || !(await this.userContext.isTenantAdmin(tenantId))) {
      throw new ForbiddenException('You are not allowed to change this users presence');
    }

    return this.presenceService.clearUserPresence(tenantUser.id);
  }

  private userEntityToDTO(entity: TenantUserEntity, presence?: ViewPresenceDTO): ViewTenantUserDTO {
    return {
      id: entity.user.id,
      name: entity.user.name,
      email: entity.email ?? entity.user.email,
      workPhone: entity?.workPhone,
      isWorkPhonePrivate: entity?.isWorkPhonePrivate,
      mobilePhone: entity?.mobilePhone,
      isMobilePhonePrivate: entity?.isMobilePhonePrivate,
      jobTitle: entity?.jobTitle,
      scopes: entity?.scopes
        .toArray()
        .map((scope) => ({ id: scope.id, name: scope.name, color: scope.color, createdAt: scope.createdAt, updatedAt: scope.updatedAt })),
      presence: presence ?? { availability: UserAvailability.Available },
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private inviteEntityToDTO(entity: TenantInviteEntity): ViewTenantInviteDTO {
    return {
      id: entity.id,
      email: entity.email,
      expiresAt: entity.expiresAt,
      inviteSentAt: entity.inviteSentAt,
      createdAt: entity.createdAt
    };
  }
}

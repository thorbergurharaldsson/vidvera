import {
  BaseEntity,
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Unique,
  UuidType
} from '@mikro-orm/core';
import { TenantRole } from '@vidvera/core';
import { ScopeEntity } from '../scopes/scope.entity';
import { UserEntity } from './user.entity';
import { TenantEntity } from '../tenants/tenant.entity';
import { PresenceSessionEntity } from '../presence/presence-session.entity';
import { TenantUserPresenceEntity } from '../presence/tenant-user-presence.entity';

@Entity({ tableName: 'tenants_users' })
@Unique({ properties: ['tenant', 'user'] })
export class TenantUserEntity extends BaseEntity<TenantUserEntity, 'id'> {
  constructor(
    tenant: TenantEntity,
    user: UserEntity,
    role?: TenantRole,
    workPhone?: string,
    isWorkPhonePrivate?: boolean,
    mobilePhone?: string,
    isMobilePhonePrivate?: boolean,
    jobTitle?: string,
    email?: string
  ) {
    super();
    this.tenant = tenant;
    this.user = user;
    this.role = role ?? TenantRole.User;
    this.workPhone = workPhone;
    this.isWorkPhonePrivate = isWorkPhonePrivate ?? false;
    this.mobilePhone = mobilePhone;
    this.isMobilePhonePrivate = isMobilePhonePrivate ?? false;
    this.jobTitle = jobTitle;
    this.email = email;
  }

  @PrimaryKey({ type: UuidType, defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @ManyToOne({ entity: () => TenantEntity, fieldName: 'tenantId' })
  tenant: TenantEntity;

  @ManyToOne({ entity: () => UserEntity, fieldName: 'userId' })
  user: UserEntity;

  @OneToOne({ entity: () => TenantUserPresenceEntity, fieldName: 'presenceId', mappedBy: (presence) => presence.user, nullable: true })
  presence?: TenantUserPresenceEntity;

  @OneToMany(() => PresenceSessionEntity, (session) => session.user)
  presenceSessions = new Collection<PresenceSessionEntity>(this);

  @ManyToMany(() => ScopeEntity, (scope) => scope.users)
  scopes = new Collection<ScopeEntity>(this);

  @Enum({ items: () => TenantRole, default: TenantRole.User })
  role: TenantRole;

  @Property({ nullable: true })
  workPhone?: string;

  @Property()
  isWorkPhonePrivate: boolean;

  @Property({ nullable: true })
  mobilePhone?: string;

  @Property()
  isMobilePhonePrivate!: boolean;

  @Property({ nullable: true })
  jobTitle?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

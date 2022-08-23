import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core';
import { UserAvailability } from '@vidvera/core';
import { TenantUserEntity } from '../users/tenant-user.entity';

@Entity({ tableName: 'tenant_user_presence' })
export class TenantUserPresenceEntity {
  constructor(user: TenantUserEntity, availability: UserAvailability, expiresAt: Date, message?: string) {
    this.user = user;
    this.availability = availability;
    this.expiresAt = expiresAt;
    this.message = message;
  }

  @OneToOne({ entity: () => TenantUserEntity, primary: true, inversedBy: (user) => user.presence, fieldName: 'userId' })
  user: TenantUserEntity;

  @Enum({ items: () => UserAvailability })
  availability: UserAvailability;

  @Property({ nullable: true })
  message?: string;

  @Property()
  expiresAt: Date;

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();

  @Property({ onCreate: () => new Date(), defaultRaw: 'now()' })
  createdAt: Date = new Date();
}

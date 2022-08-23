import { Entity, Enum, ManyToOne, PrimaryKey, Property, UuidType } from '@mikro-orm/core';

import { UserAvailability, UserActivity } from '@vidvera/core';
import { TenantUserEntity } from '../users/tenant-user.entity';

@Entity({
  tableName: 'presence_sessions'
})
export class PresenceSessionEntity {
  constructor(user: TenantUserEntity, availability: UserAvailability, expiresAt: Date, activity?: UserActivity, message?: string) {
    this.user = user;
    this.availability = availability;
    this.expiresAt = expiresAt;
    this.activity = activity;
    this.message = message;
  }

  @PrimaryKey({ type: UuidType, defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @ManyToOne(() => TenantUserEntity)
  user: TenantUserEntity;

  @Enum({ items: () => UserAvailability })
  availability: UserAvailability;

  @Enum({ items: () => UserActivity, nullable: true })
  activity?: UserActivity;

  @Property({ nullable: true })
  message?: string;

  @Property()
  expiresAt: Date;

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();

  @Property({ onCreate: () => new Date(), defaultRaw: 'now()' })
  createdAt: Date = new Date();
}

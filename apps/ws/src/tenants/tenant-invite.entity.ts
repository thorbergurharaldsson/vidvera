import { Entity, ManyToOne, PrimaryKey, Property, UuidType } from '@mikro-orm/core';
import { TenantEntity } from './tenant.entity';

@Entity({
  tableName: 'tenant_invites'
})
export class TenantInviteEntity {
  constructor(email: string, tenant: TenantEntity, expiresAt: Date) {
    this.email = email;
    this.tenant = tenant;
    this.expiresAt = expiresAt;
  }

  @PrimaryKey({ type: UuidType, defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @Property()
  email: string;

  @ManyToOne({ entity: () => TenantEntity, fieldName: 'tenantId' })
  tenant: TenantEntity;

  @Property({ nullable: true })
  acceptedAt?: Date;

  @Property({ nullable: true })
  inviteSentAt?: Date;

  @Property()
  expiresAt: Date;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

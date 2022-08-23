import { BaseEntity, Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { TenantUserEntity } from '../users/tenant-user.entity';
import { TenantEntity } from '../tenants/tenant.entity';

@Entity({ tableName: 'scopes' })
export class ScopeEntity extends BaseEntity<ScopeEntity, 'id'> {
  constructor(name: string, color: string, tenant: TenantEntity) {
    super();
    this.name = name;
    this.color = color;
    this.tenant = tenant;
  }

  @PrimaryKey()
  id!: number;

  @ManyToMany(() => TenantUserEntity, undefined, { joinColumn: 'scopeId', inverseJoinColumn: 'userId' })
  users = new Collection<TenantUserEntity>(this);

  @ManyToOne({ entity: () => TenantEntity, onDelete: 'CASCADE' })
  tenant: TenantEntity;

  @Property()
  name: string;

  @Property({ length: 7, default: '#000000' })
  color: string;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

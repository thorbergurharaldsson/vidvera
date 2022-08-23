import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property, Unique, UuidType } from '@mikro-orm/core';
import { ScopeEntity } from '../scopes/scope.entity';
import { TenantUserEntity } from '../users/tenant-user.entity';

@Entity({ tableName: 'tenants' })
export class TenantEntity extends BaseEntity<TenantEntity, 'id'> {
  constructor(name: string, displayName: string) {
    super();
    this.name = name;
    this.displayName = displayName;
  }

  @PrimaryKey({ type: UuidType, defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @OneToMany(() => TenantUserEntity, (tenantUser) => tenantUser.tenant)
  users = new Collection<TenantUserEntity>(this);

  @OneToMany(() => ScopeEntity, (scope) => scope.tenant)
  scopes = new Collection<ScopeEntity>(this);

  @Unique()
  @Property()
  name!: string;

  @Property()
  displayName: string;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

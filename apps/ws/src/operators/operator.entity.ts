import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property, Unique, UuidType } from '@mikro-orm/core';
import { OperatorTenantEntity } from './operator-tenant.entity';
import { OperatorUserEntity } from './operator-user.entity';

@Entity({
  tableName: 'operators'
})
export class OperatorEntity extends BaseEntity<OperatorEntity, 'id'> {
  constructor(name: string, displayName: string) {
    super();

    this.name = name;
    this.displayName = displayName;
  }

  @PrimaryKey({ type: UuidType, defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @Unique()
  @Property()
  name: string;

  @Property()
  displayName: string;

  @OneToMany(() => OperatorUserEntity, (operatorUser) => operatorUser.operator)
  users = new Collection<OperatorUserEntity>(this);

  @OneToMany(() => OperatorTenantEntity, (operatorTenant) => operatorTenant.operator)
  tenants = new Collection<OperatorTenantEntity>(this);

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();

  @Property({ onCreate: () => new Date(), defaultRaw: 'now()' })
  createdAt: Date = new Date();
}

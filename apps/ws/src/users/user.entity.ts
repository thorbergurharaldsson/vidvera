import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { TenantUserEntity } from './tenant-user.entity';

@Entity({ tableName: 'users' })
export class UserEntity extends BaseEntity<UserEntity, 'id'> {
  constructor(id: string, name?: string, email?: string) {
    super();
    this.id = id;
    this.name = name;
    this.email = email;
  }

  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  email?: string;

  @OneToMany(() => TenantUserEntity, (tenantUser) => tenantUser.user)
  tenants = new Collection<TenantUserEntity>(this);

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

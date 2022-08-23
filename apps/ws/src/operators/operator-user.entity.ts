import { BaseEntity, Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { OperatorRole } from '@vidvera/core';

import { UserEntity } from '../users/user.entity';
import { OperatorEntity } from './operator.entity';

@Entity({
  tableName: 'operator_users'
})
export class OperatorUserEntity extends BaseEntity<OperatorUserEntity, 'user'> {
  constructor(user: UserEntity, operator: OperatorEntity, role: OperatorRole = OperatorRole.User) {
    super();
    this.user = user;
    this.operator = operator;
    this.role = role;
  }

  @ManyToOne({ entity: () => UserEntity, primary: true, fieldName: 'userId' })
  user: UserEntity;

  @ManyToOne({ entity: () => OperatorEntity, fieldName: 'operatorId' })
  operator: OperatorEntity;

  @Enum({ items: () => OperatorRole, default: OperatorRole.User })
  role: OperatorRole = OperatorRole.User;

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();

  @Property({ onCreate: () => new Date(), defaultRaw: 'now()' })
  createdAt: Date = new Date();
}

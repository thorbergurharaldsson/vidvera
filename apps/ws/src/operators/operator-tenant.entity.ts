import { BaseEntity, Entity, Enum, ManyToOne, OneToOne, Property } from '@mikro-orm/core';
import { OperatorTenantStatus } from '@vidvera/core';
import { TenantEntity } from '../tenants/tenant.entity';
import { OperatorEntity } from './operator.entity';

@Entity({
  tableName: 'operator_tenants'
})
export class OperatorTenantEntity extends BaseEntity<OperatorTenantEntity, 'tenant'> {
  constructor(tenant: TenantEntity, operator: OperatorEntity, status: OperatorTenantStatus = OperatorTenantStatus.Pending) {
    super();
    this.tenant = tenant;
    this.operator = operator;
    this.status = status;
  }

  @OneToOne({ entity: () => TenantEntity, fieldName: 'tenantId', primary: true })
  tenant: TenantEntity;

  @ManyToOne({ entity: () => OperatorEntity, fieldName: 'operatorId' })
  operator: OperatorEntity;

  @Enum({ items: () => OperatorTenantStatus, default: OperatorTenantStatus.Pending })
  status: OperatorTenantStatus;

  @Property({ onUpdate: () => new Date(), defaultRaw: 'now()' })
  updatedAt: Date = new Date();

  @Property({ onCreate: () => new Date(), defaultRaw: 'now()' })
  createdAt: Date = new Date();
}

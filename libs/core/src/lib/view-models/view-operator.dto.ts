import { ViewOperatorTenantDTO } from './view-operator-tenant.dto';
import { ViewOperatorUserDTO } from './view-operator-user.dto';

export class ViewOperatorDTO {
  id!: string;
  name!: string;
  displayName!: string;
  users?: ViewOperatorUserDTO[];
  tenants?: ViewOperatorTenantDTO[];
  updatedAt!: string;
  createdAt!: string;
}

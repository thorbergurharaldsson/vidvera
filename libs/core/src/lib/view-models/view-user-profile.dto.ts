import { TenantRole } from '@vidvera/core';

export class ViewUserProfileDTO {
  id!: string;
  name?: string;
  email?: string;
  tenants: Array<{
    tenantId: string;
    name: string;
    displayName: string;
    userId: string;
    role: TenantRole;
  }> = [];
}

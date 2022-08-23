import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Get } from 'type-fest';

import { AppRole, AuthContextState, TenantRole } from '@vidvera/shared';

import { keycloak, keycloakOptions } from './keycloak';
import { fetchUserProfile } from './api/users';
import { ViewUserProfileDTO } from '@vidvera/core';

export const AuthContext = React.createContext<AuthContextState>({
  authenticated: false,
  user: null,
  profile: null
});

/**
 * Check if the user is in the given role
 *
 * To check for realm role, role string should start with realm:nameofrole
 *
 * To check application role either use the role string as is or prefix it with clientId:nameofrole
 */
export const hasRole = (role: string): boolean => {
  if (!keycloak.authenticated) {
    return false;
  }

  const parts = role.split(':');

  const token = keycloak.tokenParsed;

  if (parts.length === 1) {
    if (!token?.resource_access?.[keycloakOptions.clientId]) {
      return false;
    }

    return token.resource_access[keycloakOptions.clientId].roles.includes(role);
  }

  if (parts[0] === 'realm') {
    if (!token?.realm_access) {
      return false;
    }
    return token.realm_access.roles.includes(role);
  }

  if (!token?.resource_access?.[parts[0]]) {
    return false;
  }

  return token.resource_access[parts[0]].roles.includes(parts[1]);
};

export const isTenantAdmin = (tenantId: string, userTenants: Get<ViewUserProfileDTO, 'tenants'> = []): boolean => {
  if (userTenants.length === 0) {
    return false;
  }

  if (hasRole(AppRole.Superuser)) {
    return true;
  }

  return userTenants.some((tenant) => tenant.tenantId === tenantId && tenant.role === TenantRole.Admin);
};

export const isTenantMember = (tenantId: string, userTenants: Get<ViewUserProfileDTO, 'tenants'>): boolean => {
  if (userTenants.length === 0) {
    return false;
  }

  if (hasRole(AppRole.Superuser)) {
    return true;
  }

  return userTenants.some((tenant) => tenant.tenantId === tenantId);
};

export function AuthProvider(props: any) {
  const { initialized, keycloak } = useKeycloak();
  const [context, setContext] = useState<AuthContextState>({
    authenticated: false,
    user: null,
    profile: null
  });

  const profileQuery = useQuery(['userProfile'], async () => fetchUserProfile(), { enabled: initialized && keycloak.authenticated });

  useEffect(() => {
    (async () => {
      if (initialized && keycloak.authenticated) {
        const user: any = await keycloak.loadUserInfo();

        setContext({
          authenticated: keycloak.authenticated,
          user,
          profile: profileQuery.data ?? null
        });
      }
    })();
  }, [initialized, keycloak.authenticated, profileQuery.isSuccess]);

  if (!initialized) {
    return <span>Loading...</span>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return <div>Redirecting...</div>;
  }

  if (!context.authenticated) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={context}>{props.children}</AuthContext.Provider>;
}

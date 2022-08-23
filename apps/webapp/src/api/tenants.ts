import axios from './axios';

import { PaginatedList } from '@nestjs-snerpa/common';
import {
  AcceptTenantInviteDTO,
  CreateTenantDTO,
  CreateTenantInviteDTO,
  SetUserPresenceDTO,
  UpdateScopeDTO,
  UpdateTenantDTO,
  UpdateTenantUserDTO,
  ViewPresenceDTO,
  ViewScopeDTO,
  ViewTenantDTO,
  ViewTenantInviteDTO,
  ViewTenantUserDTO
} from '@vidvera/core';

export const fetchTenants = async (filters?: { name?: string }, page?: number, size?: number): Promise<PaginatedList<any>> => {
  const response = await axios.get('/tenants', {
    params: {
      page,
      size,
      ...(filters ?? {})
    }
  });

  return response.data;
};

export const fetchTenantByNameOrId = async (nameOrId: string): Promise<ViewTenantDTO> => {
  const response = await axios.get(`/tenant/${nameOrId}`);

  return response.data;
};

export const createTenant = async (tenant: CreateTenantDTO): Promise<ViewTenantDTO> => {
  const response = await axios.post(`/tenants/`, tenant);

  return response.data;
};

export const updateTenant = async (tenantId: string, tenant: UpdateTenantDTO): Promise<ViewTenantDTO> => {
  const response = await axios.put(`/tenant/${tenantId}`, tenant);

  return response.data;
};

export const deleteTenant = async (tenantId: string): Promise<void> => {
  await axios.delete(`/tenant/${tenantId}`);
};

export const fetchTenantUsers = async (
  tenantId: string,
  query?: string,
  filters?: { scopes?: string[] }
): Promise<PaginatedList<ViewTenantUserDTO>> => {
  const response = await axios.get(`/tenant/${tenantId}/users`, {
    params: {
      q: query,
      scopes: filters?.scopes
    }
  });

  return response.data;
};

export const fetchTenantScopes = async (
  tenantId: string,
  filters?: { name: string },
  page?: number,
  size?: number
): Promise<PaginatedList<any>> => {
  const response = await axios.get(`/tenant/${tenantId}/scopes`, {
    params: {
      page,
      size,
      ...(filters ?? {})
    }
  });

  return response.data;
};

export const fetchTenantScope = async (tenantId: string, scopeId: string): Promise<ViewScopeDTO> => {
  const response = await axios.get(`/tenant/${tenantId}/scope/${scopeId}`);

  return response.data;
};

export const updateTenantScope = async (tenantId: string, scopeId: string, scope: UpdateScopeDTO): Promise<any> => {
  const response = await axios.put(`/tenant/${tenantId}/scope/${scopeId}`, scope);

  return response.data;
};

export const deleteTenantScope = async (tenantId: string, scopeId: string): Promise<void> => {
  await axios.delete(`/tenant/${tenantId}/scope/${scopeId}`);
};

export const createTenantUserInvite = async (tenantId: string, invite: CreateTenantInviteDTO): Promise<any> => {
  const response = await axios.post(`/tenant/${tenantId}/invites`, invite);

  return response.data;
};

export const fetchTenantUserInvites = async (tenantId: string): Promise<ViewTenantInviteDTO[]> => {
  const response = await axios.get(`/tenant/${tenantId}/invites`);

  return response.data;
};

export const fetchTenantUserInvite = async (tenantId: string, inviteId: string): Promise<ViewTenantInviteDTO> => {
  const response = await axios.get(`/tenant/${tenantId}/invite/${inviteId}`);

  return response.data;
};

export const deleteTenantUserInvite = async (tenantId: string, inviteId: string): Promise<void> => {
  await axios.delete(`/tenant/${tenantId}/invite/${inviteId}`);
};

export const acceptTenantUserInvite = async (
  tenantId: string,
  inviteId: string,
  user: AcceptTenantInviteDTO
): Promise<ViewTenantUserDTO> => {
  const response = await axios.post(`/tenant/${tenantId}/invite/${inviteId}/accept`, user);

  return response.data;
};

export const setTenantUserPresence = async (tenantId: string, userId: string, presence: SetUserPresenceDTO): Promise<ViewPresenceDTO> => {
  const response = await axios.post(`/tenant/${tenantId}/user/${userId}/presence`, presence);

  return response.data;
};

export const clearTenantUserPresence = async (tenantId: string, userId: string): Promise<ViewPresenceDTO> => {
  const response = await axios.delete(`/tenant/${tenantId}/user/${userId}/presence`);

  return response.data;
};

export const fetchTenantUser = async (tenantId: string, userId: string): Promise<ViewTenantUserDTO> => {
  const response = await axios.get(`/tenant/${tenantId}/user/${userId}`);

  return response.data;
};

export const deleteTenantUser = async (tenantId: string, userId: string): Promise<void> => {
  await axios.delete(`/tenant/${tenantId}/users/${userId}`);
};

export const updateTenantUser = async (tenantId: string, userId: string, user: UpdateTenantUserDTO): Promise<ViewTenantUserDTO> => {
  const response = await axios.put(`/tenant/${tenantId}/users/${userId}`, user);

  return response.data;
};

import { PaginatedList } from '@nestjs-snerpa/common';
import { UpdateUserDTO, ViewUserDTO, ViewUserProfileDTO } from '@vidvera/core';

import axios from './axios';

export const fetchUserProfile = async (userId = 'me'): Promise<ViewUserProfileDTO> => {
  const response = await axios.get(`/user/${userId}/profile`);

  return response.data;
};

export const queryUsers = async (
  filters?: { email?: string; name?: string; tenant?: string },
  page?: number,
  size?: number
): Promise<PaginatedList<ViewUserDTO>> => {
  const response = await axios.get('/users', {
    params: {
      page,
      size,
      ...(filters ?? {})
    }
  });

  return response.data;
};

export const fetchUser = async (userId: string): Promise<ViewUserDTO> => {
  const response = await axios.get(`/user/${userId}`);

  return response.data;
};

export const updateUser = async (userId: string, user: UpdateUserDTO): Promise<ViewUserDTO> => {
  const response = await axios.put(`/user/${userId}`, user);

  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`/user/${userId}`);
};

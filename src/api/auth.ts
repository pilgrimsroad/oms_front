import client from './client';
import type { LoginRequest, LoginResponse } from '../types';

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>('/api/auth/login', request);
  return data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  await client.post('/api/auth/logout', refreshToken ? { refreshToken } : undefined);
};

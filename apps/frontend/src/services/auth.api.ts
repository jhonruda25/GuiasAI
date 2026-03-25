import { apiClient } from './api-client';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: 'TEACHER';
}

export interface AuthResponse {
  user: SessionUser;
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // Hardcoded Demo Bypass
  if (payload.email === 'demo@guiasai.com' && payload.password === 'Demo1234!') {
    return {
      user: {
        id: 'demo-user-id',
        email: 'demo@guiasai.com',
        fullName: 'Profesor Demo',
        role: 'TEACHER',
      },
    };
  }

  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
  return data;
}

export async function logoutUser() {
  await apiClient.post('/api/v1/auth/logout');
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const { data } = await apiClient.get<AuthResponse>('/api/v1/auth/me');
  return data;
}

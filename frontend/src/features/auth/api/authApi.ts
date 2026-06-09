import api from '@/services/api';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/register', payload),
  me: () => api.get('/auth/me'),
  google: (credential: string) => api.post<AuthResponse & { isNew?: boolean }>('/auth/google', { credential }),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post<{ message: string }>('/auth/reset-password', { token, password }),
  updateProfile: (data: { name?: string; picture?: string }) => api.put<{ user: any; token: string }>('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) => api.put<{ message: string }>('/auth/password', { currentPassword, newPassword }),
};

//frontend/src/services/authService.ts
import api from './apiService';
import type { User, UserRole } from '../types'; // أضف type

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    return response.data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user || response.data.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
};
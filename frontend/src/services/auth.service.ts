import api, { tokenManager } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register/', data);
    
    if (response.data.tokens) {
      tokenManager.setTokens(response.data.tokens);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login/', credentials);
    
    if (response.data.tokens) {
      tokenManager.setTokens(response.data.tokens);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
    }
  }

  async verifyToken(): Promise<User> {
    const response = await api.get<{ user: User }>('/api/auth/verify/');
    return response.data.user;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/api/auth/profile/');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<{ user: User }>('/api/auth/profile/update/', data);
    return response.data.user;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }
}

const authService = new AuthService();
export default authService;

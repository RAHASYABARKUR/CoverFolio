import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthContextType,
} from '../types/auth.types';
import authService from '../services/auth.service';
import { tokenManager } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = tokenManager.getTokens();
      const storedUser = authService.getCurrentUser();

      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);

        // Verify token is still valid
        try {
          const verifiedUser = await authService.verifyToken();
          setUser(verifiedUser);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, clear auth state
          handleLogout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setTokens(response.tokens);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Check for different error response formats
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log the full error for debugging
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (data: RegisterData): Promise<void> => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setTokens(response.tokens);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleLogout = (): void => {
    authService.logout();
    setUser(null);
    setTokens(null);
  };

  const value: AuthContextType = {
    user,
    tokens,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAuthenticated: !!user && !!tokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

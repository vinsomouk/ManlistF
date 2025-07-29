// src/hooks/useAuth.tsx
import { useState, useEffect } from 'react';
import type { User } from '../components/services/auth';
import {
  getCurrentUser,
  addAuthListener,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  checkAuth as apiCheckAuth,
  updateProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount
} from '../components/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = addAuthListener(setUser);
    
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await apiCheckAuth();
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiLogin(email, password);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    register: async (email: string, nickname: string, password: string, profilePicture?: string) => {
      setIsLoading(true);
      try {
        await apiRegister(email, nickname, password, profilePicture);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    updateProfile: async (data: {
      email: string;
      nickname: string;
      profilePicture?: string | null;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      setIsLoading(true);
      try {
        // CORRECTION FINALE : Appel avec un seul argument
        await apiUpdateProfile(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    deleteAccount: async () => {
      setIsLoading(true);
      try {
        // CORRECTION FINALE : Appel sans argument
        await apiDeleteAccount();
        setError(null);
        setUser(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Deletion failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  };
};

export type { User };
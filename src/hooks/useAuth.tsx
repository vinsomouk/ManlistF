// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { User, } from '../components/services/auth';
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

  // Synchronisation avec l'état global
  useEffect(() => {
    const unsubscribe = addAuthListener(setUser);
    apiCheckAuth().finally(() => setIsLoading(false));
    return unsubscribe;
  }, []);

  // Méthodes d'authentification
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
    register: async (email: string, nickname: string, password: string) => {
      setIsLoading(true);
      try {
        await apiRegister(email, nickname, password);
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
      currentPassword?: string;
      newPassword?: string;
    }) => {
      if (!user) return;
      setIsLoading(true);
      try {
        await apiUpdateProfile(user.id, data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    deleteAccount: async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        await apiDeleteAccount(user.id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Deletion failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  };
};
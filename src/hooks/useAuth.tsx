import { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';
import type { User } from '../components/services/auth';

import {
  getCurrentUser,
  addAuthListener,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  checkAuth as apiCheckAuth,
  updateProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount,
} from '../components/services/auth';

interface QuestionnaireCompletionResponse {
  completed: boolean;
}

async function parseJson<T>(
  response: Response,
): Promise<T> {
  return response.json() as Promise<T>;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(
    getCurrentUser(),
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = addAuthListener(setUser);

    const initializeAuth = async (): Promise<void> => {
      setIsLoading(true);

      try {
        await apiCheckAuth();
      } catch (caughtError) {
        console.error(
          'Auth check error:',
          caughtError,
        );
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      await apiLogin(email, password);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Login failed',
      );

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiLogout();
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Logout failed',
      );

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    nickname: string,
    password: string,
    profilePicture?: string,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      await apiRegister(
        email,
        nickname,
        password,
        profilePicture,
      );

      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Registration failed',
      );

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    formData: FormData,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      await apiUpdateProfile(formData);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Update failed',
      );

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiDeleteAccount();

      setError(null);
      setUser(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Deletion failed',
      );

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const hasCompletedQuestionnaire = async (
    questionnaireId: number,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/questionnaires/${questionnaireId}/completed`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        return false;
      }

      const data =
        await parseJson<QuestionnaireCompletionResponse>(
          response,
        );

      return data.completed;
    } catch (caughtError) {
      console.error(
        'Completion check error:',
        caughtError,
      );

      return false;
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
    register,
    updateProfile,
    deleteAccount,
    hasCompletedQuestionnaire,
  };
};

export type { User };
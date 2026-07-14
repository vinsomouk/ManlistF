import { API_URL } from '../../../config/api';

const AUTH_API_URL = `${API_URL}/auth`;
const PROFILE_API_URL = `${API_URL}/profile`;

export interface User {
  id: string;
  email: string;
  nickname: string;
  profilePicture?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthErrorResponse {
  error?: string;
  errors?: string[];
  message?: string;
}

interface UserApiResponse {
  id: string | number;
  email: string;
  nickname: string;
  profilePicture?: string | null;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileResponse {
  user: UserApiResponse;
}

type AuthListener = (user: User | null) => void;

let currentUser: User | null = null;
let listeners: AuthListener[] = [];

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

const toUser = (data: UserApiResponse): User => ({
  id: data.id.toString(),
  email: data.email,
  nickname: data.nickname,
  profilePicture: data.profilePicture ?? null,
  isVerified: data.isVerified ?? false,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

const notifyListeners = (): void => {
  listeners.forEach((listener) => {
    listener(currentUser);
  });
};

const clearBrowserCookies = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie.split(';').forEach((cookie: string) => {
    const [name] = cookie.split('=');

    if (!name) {
      return;
    }

    document.cookie =
      `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

const setForceLogout = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      'forceLogout',
      Date.now().toString(),
    );
  }
};

export const addAuthListener = (
  listener: AuthListener,
): (() => void) => {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(
      (registeredListener) =>
        registeredListener !== listener,
    );
  };
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const register = async (
  email: string,
  nickname: string,
  password: string,
  profilePicture?: string | null,
): Promise<User> => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      nickname,
      password,
      profilePicture,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await parseJson<AuthErrorResponse>(
      response,
    ).catch(() => null);

    const errorMessage =
      errorData?.error ??
      errorData?.message ??
      (errorData?.errors?.length
        ? errorData.errors.join(', ')
        : 'Registration failed');

    throw new Error(errorMessage);
  }

  const data = await parseJson<UserApiResponse>(response);

  currentUser = toUser(data);
  notifyListeners();

  return currentUser;
};

export const login = async (
  email: string,
  password: string,
): Promise<User> => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await parseJson<AuthErrorResponse>(
      response,
    ).catch(() => null);

    throw new Error(
      errorData?.message ??
        errorData?.error ??
        'Login failed',
    );
  }

  const data = await parseJson<UserApiResponse>(response);

  currentUser = toUser(data);
  notifyListeners();

  return currentUser;
};

export const logout = async (): Promise<void> => {
  try {
    await fetch(`${AUTH_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    clearBrowserCookies();
    setForceLogout();

    currentUser = null;
    notifyListeners();
  } catch (caughtError) {
    console.error(
      'Erreur lors de la déconnexion :',
      caughtError,
    );

    setForceLogout();

    currentUser = null;
    notifyListeners();

    throw new Error('Logout failed');
  }
};

export const checkAuth =
  async (): Promise<User | null> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/check`, {
        credentials: 'include',
      });

      if (!response.ok) {
        currentUser = null;
        notifyListeners();
        return null;
      }

      const data =
        await parseJson<UserApiResponse>(response);

      currentUser = toUser(data);
      notifyListeners();

      return currentUser;
    } catch (caughtError) {
      console.error(
        "Erreur lors de la vérification d'authentification :",
        caughtError,
      );

      currentUser = null;
      notifyListeners();

      return null;
    }
  };

export const updateProfile = async (
  formData: FormData,
): Promise<User> => {
  const response = await fetch(PROFILE_API_URL, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      'PROFILE UPDATE RAW ERROR:',
      errorText,
    );

    throw new Error(errorText || 'Update failed');
  }

  const result =
    await parseJson<UpdateProfileResponse>(response);

  currentUser = toUser(result.user);
  notifyListeners();

  return currentUser;
};

export const deleteAccount = async (): Promise<void> => {
  const response = await fetch(PROFILE_API_URL, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await parseJson<AuthErrorResponse>(
      response,
    ).catch(() => null);

    throw new Error(
      errorData?.message ??
        errorData?.error ??
        'Account deletion failed',
    );
  }

  clearBrowserCookies();
  setForceLogout();

  currentUser = null;
  notifyListeners();
};

if (typeof window !== 'undefined') {
  if (window.localStorage.getItem('forceLogout')) {
    currentUser = null;
    window.localStorage.removeItem('forceLogout');
  }

  void checkAuth();
}
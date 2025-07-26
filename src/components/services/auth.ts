const API_URL = 'http://localhost:8000/api/auth';

// État global géré par le service
let currentUser: User | null = null;
type AuthListener = (user: User | null) => void;
let listeners: AuthListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(currentUser));
};

export const addAuthListener = (listener: AuthListener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const getCurrentUser = (): User | null => currentUser;

export interface User {
  id: string;
  email: string;
  nickname: string;
  profilePicture?: string | null;
}

export const register = async (
  email: string,
  nickname: string,
  password: string,
  profilePicture?: string | null
): Promise<User> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nickname, password, profilePicture }),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Registration failed');
  }

  const data = await response.json();
  currentUser = {
    id: data.id,
    email: data.email,
    nickname: data.nickname,
    profilePicture: data.profilePicture || null
  };
  notifyListeners();
  return currentUser;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Login failed');
  }

  const data = await response.json();
  currentUser = {
    id: data.id,
    email: data.email,
    nickname: data.nickname,
    profilePicture: data.profilePicture || null
  };
  notifyListeners();
  return currentUser;
};

export const logout = async (): Promise<void> => {
  try {
    // Appel API au backend

    // Effacer tous les cookies manuellement
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Marquer la déconnexion forcée
    localStorage.setItem('forceLogout', Date.now().toString());
    
    // Réinitialiser l'état
    currentUser = null;
    notifyListeners();
    
    console.log('Déconnexion forcée activée');
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err);
    // Activer quand même la déconnexion forcée en cas d'erreur
    localStorage.setItem('forceLogout', Date.now().toString());
    currentUser = null;
    notifyListeners();
    throw new Error('Logout failed');
  }
};

export const checkAuth = async (): Promise<User | null> => {
  const response = await fetch(`${API_URL}/check`, {
    credentials: 'include'
  });

  if (response.ok) {
    const data = await response.json();
    currentUser = {
      id: data.id,
      email: data.email,
      nickname: data.nickname,
      profilePicture: data.profilePicture || null
    };
    notifyListeners();
    return currentUser;
  }
  return null;
};

export const updateProfile = async (
  userId: string,
  data: {
    email: string;
    nickname: string;
    profilePicture?: string | null;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<User> => {
  const response = await fetch(`${API_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Update failed');
  }

  const result = await response.json();
  currentUser = {
    id: result.id,
    email: result.email,
    nickname: result.nickname,
    profilePicture: result.profilePicture || null
  };
  notifyListeners();
  return currentUser;
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/profile/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Account deletion failed');
  }
  currentUser = null;
  notifyListeners();
};

if (localStorage.getItem('forceLogout')) {
  currentUser = null;
  localStorage.removeItem('forceLogout');
}

// Initial check au chargement
checkAuth();
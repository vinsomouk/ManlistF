const API_URL = 'http://localhost:8000/api/auth';
const PROFILE_API_URL = 'http://localhost:8000/api/profile';

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
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
    const errorData = await response.json().catch(() => null);
    // Gestion améliorée des erreurs
    const errorMessage = errorData?.error || 
                        (errorData?.errors ? errorData.errors.join(', ') : 'Registration failed');
    throw new Error(errorMessage);
  }

  const data = await response.json();
  currentUser = {
    id: data.id.toString(), // Convertir en string
    email: data.email,
    nickname: data.nickname,
    profilePicture: data.profilePicture || null,
    isVerified: data.isVerified,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
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
    profilePicture: data.profilePicture || null,
    isVerified: data.isVerified,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
  notifyListeners();
  return currentUser;
};

export const logout = async (): Promise<void> => {
  try {
    // Appel API au backend
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

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
    
    console.log('Déconnexion réussie');
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
  try {
    const response = await fetch(`${API_URL}/check`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = {
        id: data.id,
        email: data.email,
        nickname: data.nickname,
        profilePicture: data.profilePicture || null,
        isVerified: data.isVerified,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      notifyListeners();
      return currentUser;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error);
    return null;
  }
};

export const updateProfile = async (
  data: {
    email: string;
    nickname: string;
    profilePicture?: string | null;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<User> => {
  // CORRECTION : Endpoint correct et méthode PUT
  const response = await fetch(`${PROFILE_API_URL}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || 
                         (errorData?.errors ? JSON.stringify(errorData.errors) : 'Update failed');
    throw new Error(errorMessage);
  }

  const result = await response.json();
  currentUser = {
    id: result.user.id,
    email: result.user.email,
    nickname: result.user.nickname,
    profilePicture: result.user.profilePicture || null,
    isVerified: result.user.isVerified,
    createdAt: result.user.createdAt,
    updatedAt: result.user.updatedAt
  };
  notifyListeners();
  return currentUser;
};

export const deleteAccount = async (): Promise<void> => {
  // CORRECTION : Utilisation du bon endpoint
  const response = await fetch(`${PROFILE_API_URL}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Account deletion failed');
  }
  
  // Effacer tous les cookies après suppression du compte
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  localStorage.setItem('forceLogout', Date.now().toString());
  currentUser = null;
  notifyListeners();
};

if (localStorage.getItem('forceLogout')) {
  currentUser = null;
  localStorage.removeItem('forceLogout');
}

// Initial check au chargement
checkAuth();
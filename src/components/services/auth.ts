const API_URL = 'http://localhost:8000/api/auth';

interface ApiResponse {
    success: boolean;
    message?: string;
    user?: {
        id: number;
        email: string;
        nickname: string;
    };
    error?: string;
    errors?: Record<string, string>;
}

export const register = async (email: string, nickname: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, nickname, password }),
        credentials: 'include'
    });

    const data: ApiResponse = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || JSON.stringify(data.errors));
    }

    return data;
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
    });

    const data: ApiResponse = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Échec de la connexion');
    }

    return data;
};

export const logout = async () => {
    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Échec de la déconnexion');
    }
};
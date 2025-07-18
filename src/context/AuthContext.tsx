import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  nickname: string
  profilePicture?: string
}

interface ProfileUpdateData {
  email: string
  nickname: string
  currentPassword?: string
  newPassword?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/check', {
        credentials: 'include',
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (err) {
      console.error('Auth check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Identifiants incorrects')
      }

      await checkAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Échec de la mise à jour')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur inconnue')
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Échec de la suppression')
      }
      setUser(null)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur inconnue')
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      login, 
      logout,
      updateProfile,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
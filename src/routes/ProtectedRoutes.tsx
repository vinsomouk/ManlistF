import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return user ? <>{children}</> : null
}

export default ProtectedRoute
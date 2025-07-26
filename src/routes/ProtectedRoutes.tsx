import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/MainComponents/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nouvelle prop pour flexibilité
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true // Par défaut, nécessite une authentification
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Redirection seulement si l'authentification est requise mais absente
    if (requireAuth && !user) {
      navigate('/login', { 
        replace: true,
        state: { from: location } 
      });
    }
    
    // Redirection si l'utilisateur est connecté mais tente d'accéder à une page publique
    if (!requireAuth && user) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [user, isLoading, navigate, location, requireAuth]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Spinner size="large" />
      </div>
    );
  }

  // Si l'authentification n'est pas requise, on affiche toujours les enfants
  if (!requireAuth) {
    return <>{children}</>;
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
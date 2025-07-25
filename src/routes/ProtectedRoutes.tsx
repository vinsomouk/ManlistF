import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/MainComponents/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { 
        replace: true,
        state: { from: location } 
      });
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
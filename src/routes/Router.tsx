import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from '../Dashboard';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import Profile from '../pages/User/Profile';
import Forum from '../pages/Forum';
import ListDashboard from '../pages/User/ListDashboard';
import QuestionnaireList from '../components/Questionnaire/QuestionnaireList';
import QuestionnairePage from '../pages/Questionnaire/QuestionnairePage';
import ProtectedRoute from './ProtectedRoutes';
import AnimesInformations from '../pages/AnimesPages/AnimeInformations';
import { addAuthListener } from '../components/services/auth';

// Composant pour gérer la déconnexion forcée
const AuthHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribe = addAuthListener((user) => {
      if (!user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        navigate('/login');
      }
    });

    // Vérifier la déconnexion forcée au chargement
    if (localStorage.getItem('forceLogout')) {
      localStorage.removeItem('forceLogout');
      navigate('/login');
    }

    return unsubscribe;
  }, [navigate]);

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/anime/:id',
    element: <AnimesInformations />,
  },
  {
    path: '/lists',
    element: (
      <AuthHandler>
        <ProtectedRoute>
          <ListDashboard />
        </ProtectedRoute>
      </AuthHandler>
    ),
  },
  {
    path: '/forum',
    element: <Forum />,
  },
  {
  path: '/questionnaires',
  element: <QuestionnaireList />,
},
{
  path: '/questionnaires/:id',
  element: <QuestionnairePage />,
},
  {
    path: '/profile',
    element: (
      <AuthHandler>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </AuthHandler>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
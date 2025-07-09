// Router.tsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import Forum from '../pages/Forum';
import Profile from '../pages/User/Profile';
import ListDashboard from '../pages/User/ListDashboard';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />, // Dashboard comme page racine
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
    path: '/forum',
    element: <Forum />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/lists',
    element: <ListDashboard />,
  }
]);

export default router;
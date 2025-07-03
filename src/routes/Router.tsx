// Router.tsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

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
  }
]);

export default router;
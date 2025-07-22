import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from '../Dashboard'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'
import Profile from '../pages/User/Profile'
import Forum from '../pages/Forum'
import ListDashboard from '../pages/User/ListDashboard'
import ProtectedRoute from './ProtectedRoutes'
import AnimesInformations from '../pages/AnimesPages/AnimeInformations'

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
      <ProtectedRoute>
        <ListDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/forum',
    element: <Forum />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from '../ProtectedRoutes';
import { useAuth } from '../../hooks/useAuth';

// Mock du hook useAuth
vi.mock('../../hooks/useAuth');

// Composants de test
const PublicPage = () => <div>Page Publique</div>;
const ProtectedPage = () => <div>Page Protégée</div>;
const LoginPage = () => <div>Page de Connexion</div>;

describe('ProtectedRoutes Component', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Fonction mock pour hasCompletedQuestionnaire
  const mockHasCompletedQuestionnaire = vi.fn().mockResolvedValue(false);

  it('redirige vers /login quand l\'utilisateur n\'est pas authentifié', async () => {
    // Mock: utilisateur non connecté
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page de Connexion')).toBeInTheDocument();
      expect(screen.queryByText('Page Protégée')).not.toBeInTheDocument();
    });
  });

  it('affiche la page protégée quand l\'utilisateur est authentifié', async () => {
    // Mock: utilisateur connecté
    mockUseAuth.mockReturnValue({
        user: {
            id: '1', email: 'test@user.com', nickname: 'TestUser',
            isVerified: false,
            createdAt: '',
            updatedAt: ''
        },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page Protégée')).toBeInTheDocument();
      expect(screen.queryByText('Page de Connexion')).not.toBeInTheDocument();
    });
  });

  it('affiche un loader pendant la vérification de l\'authentification', async () => {
    // Mock: vérification en cours
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Page Protégée')).not.toBeInTheDocument();
      expect(screen.queryByText('Page de Connexion')).not.toBeInTheDocument();
    });
  });

  it('conserve la location de redirection', async () => {
    // Mock: utilisateur non connecté
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/protected?param=value']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page de Connexion')).toBeInTheDocument();
      // Vérifie que la location est passée dans l'état
      expect(window.location.pathname).toBe('/login');
      expect(window.location.search).toBe('?redirect=%2Fprotected%3Fparam%3Dvalue');
    });
  });

  it('gère les erreurs d\'authentification', async () => {
    // Mock: erreur d'authentification
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: 'Erreur de vérification',
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page de Connexion')).toBeInTheDocument();
    });
  });

  it('permet l\'accès aux routes publiques sans authentification', async () => {
    // Mock: utilisateur non connecté
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route path="/public" element={<PublicPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page Publique')).toBeInTheDocument();
    });
  });

  it('redirige correctement après connexion', async () => {
    // Mock: changement d'état d'authentification
    const mockLogin = vi.fn();
    
    // Premier rendu: utilisateur non connecté
    mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Deuxième rendu: utilisateur connecté
    mockUseAuth.mockReturnValue({
        user: {
            id: '1', email: 'test@user.com', nickname: 'TestUser',
            isVerified: false,
            createdAt: '',
            updatedAt: ''
        },
        isLoading: false,
        error: null,
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        hasCompletedQuestionnaire: mockHasCompletedQuestionnaire
    });

    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes children={undefined} />}>
            <Route path="/protected" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page Protégée')).toBeInTheDocument();
    });
  });
});
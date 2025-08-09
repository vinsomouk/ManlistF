// src/pages/Auth/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { useAuth } from '../../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });
  });

  it('soumet le formulaire avec les données valides', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@user.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@user.com', 'Password123!');
    });
  });

  it('affiche une erreur pour les identifiants invalides', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Identifiants invalides'
    });

    render(<LoginPage />);
    
    expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
  });

  it('bloque la soumission pendant le chargement', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null
    });

    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Connexion...' });
    expect(submitButton).toBeDisabled();
  });
});
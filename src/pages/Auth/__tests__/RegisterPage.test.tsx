// src/pages/Auth/__tests__/RegisterPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../RegisterPage';
import { register } from '../../../components/services/auth';

// Mock du service d'authentification
vi.mock('../../../components/services/auth');

describe('RegisterPage Component', () => {
  const mockRegister = vi.mocked(register);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('affiche correctement le formulaire d\'inscription', () => {
    render(<RegisterPage />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Pseudo')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmer le mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'S\'inscrire' })).toBeInTheDocument();
  });

  it('valide les entrées du formulaire', async () => {
    render(<RegisterPage />);
    
    // Remplir le formulaire avec des données invalides
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'invalid-email' } 
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), { 
      target: { value: 'ab' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'weak' } 
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { 
      target: { value: 'different' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'S\'inscrire' }));
    
    // Vérifier les messages d'erreur
    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
      expect(screen.getByText('Minimum 3 caractères')).toBeInTheDocument();
      expect(screen.getByText('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial')).toBeInTheDocument();
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
  });

  it('soumet le formulaire avec des données valides', async () => {
    // Configurer le mock pour simuler une inscription réussie
    mockRegister.mockResolvedValue({
      id: '1',
      email: 'test@user.com',
      nickname: 'TestUser',
      profilePicture: null,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    render(<RegisterPage />);
    
    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@user.com' } 
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), { 
      target: { value: 'TestUser' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'StrongPassword123!' } 
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { 
      target: { value: 'StrongPassword123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'S\'inscrire' }));
    
    // Vérifier l'appel au service
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'test@user.com',
        'TestUser',
        'StrongPassword123!'
      );
    });
    
    // Vérifier le message de succès
    expect(screen.getByText('Inscription réussie ! Redirection...')).toBeInTheDocument();
  });

  it('gère les erreurs d\'inscription', async () => {
    // Configurer le mock pour simuler une erreur
    mockRegister.mockRejectedValue(new Error('Email déjà utilisé'));

    render(<RegisterPage />);
    
    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'existing@user.com' } 
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), { 
      target: { value: 'ExistingUser' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'S\'inscrire' }));
    
    // Vérifier le message d'erreur
    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument();
    });
  });

  it('affiche un indicateur de chargement pendant l\'inscription', async () => {
    // Configurer le mock pour une réponse lente
    mockRegister.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({} as any), 1000))
    );

    render(<RegisterPage />);
    
    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@user.com' } 
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), { 
      target: { value: 'TestUser' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'S\'inscrire' }));
    
    // Vérifier que le bouton est désactivé et affiche "Inscription en cours..."
    expect(screen.getByRole('button', { name: 'Inscription en cours...' })).toBeDisabled();
  });

  it('redirige vers la page de connexion après inscription réussie', async () => {
    // Configurer le mock pour simuler une inscription réussie
    mockRegister.mockResolvedValue({
      id: '1',
      email: 'test@user.com',
      nickname: 'TestUser',
      profilePicture: null,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    render(<RegisterPage />);
    
    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@user.com' } 
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), { 
      target: { value: 'TestUser' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'S\'inscrire' }));
    
    // Vérifier la redirection après 2 secondes
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    }, { timeout: 2500 });
  });
});
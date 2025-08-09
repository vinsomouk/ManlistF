// src/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { login, logout,  } from '../../components/services/auth';

jest.mock('../components/services/auth');

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gère correctement la connexion', async () => {
    (login as jest.Mock).mockResolvedValue({
      id: '1', email: 'test@user.com', nickname: 'TestUser'
    });

    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@user.com', 'password');
    });

    expect(result.current.user).toEqual({
      id: '1', email: 'test@user.com', nickname: 'TestUser'
    });
    expect(localStorage.getItem('authToken')).toBeTruthy();
  });

  it('gère les erreurs de connexion', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('wrong@user.com', 'wrongpass');
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });

  it('gère correctement la déconnexion', async () => {
    (login as jest.Mock).mockResolvedValue({ /* user data */ });
    (logout as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    
    // Login first
    await act(async () => {
      await result.current.login('test@user.com', 'password');
    });
    
    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
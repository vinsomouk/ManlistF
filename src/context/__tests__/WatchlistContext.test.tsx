// src/context/__tests__/WatchlistContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../WatchlistContext';
import { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist } from '../../components/services/anilistService';

// Mock des services
vi.mock('../../components/services/anilistService');

const mockWatchlist = [
  {
    animeId: 101,
    status: 'WATCHING' as const,
    progress: 3,
    score: 85,
    notes: 'Très bon anime',
    animeTitle: 'Demon Slayer',
    animeImage: 'cover1.jpg'
  }
];

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const { 
    watchlist, 
    loading, 
    error,
    addToWatchlist: add,
    updateWatchlistItem: update,
    removeFromWatchlist: remove,
    fetchWatchlist: fetch
  } = useWatchlist();

  return (
    <div>
      <div data-testid="watchlist">{JSON.stringify(watchlist)}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error}</div>
      
      <button onClick={() => add({
          animeId: 202, status: 'PLANNED',
          progress: 0
      })}>
        Add Item
      </button>
      
      <button onClick={() => update(101, { status: 'COMPLETED' })}>
        Update Item
      </button>
      
      <button onClick={() => remove(101)}>
        Remove Item
      </button>
      
      <button onClick={() => fetch()}>
        Refresh
      </button>
    </div>
  );
};

describe('WatchlistContext', () => {
  const mockGetWatchlist = vi.mocked(getWatchlist);
  const mockAddToWatchlist = vi.mocked(addToWatchlist);
  const mockUpdateWatchlistItem = vi.mocked(updateWatchlistItem);
  const mockRemoveFromWatchlist = vi.mocked(removeFromWatchlist);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fournit la watchlist initiale', async () => {
    mockGetWatchlist.mockResolvedValue(mockWatchlist);
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // Vérifier l'état initial de chargement
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    
    // Attendre le chargement des données
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
  });

  it('gère les erreurs de chargement', async () => {
    mockGetWatchlist.mockRejectedValue(new Error('Erreur réseau'));
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Erreur réseau');
    });
  });

  it('ajoute un nouvel élément à la watchlist', async () => {
    mockGetWatchlist.mockResolvedValue(mockWatchlist);
    mockAddToWatchlist.mockResolvedValue({
      ...mockWatchlist[0],
      animeId: 202,
      status: 'PLANNED'
    });
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
    
    // Ajouter un nouvel élément
    fireEvent.click(screen.getByText('Add Item'));
    
    await waitFor(() => {
      expect(mockAddToWatchlist).toHaveBeenCalledWith({
        animeId: 202,
        status: 'PLANNED'
      });
      
      // Vérifier que la watchlist contient le nouvel élément
      const updatedWatchlist = [...mockWatchlist, {
        animeId: 202,
        status: 'PLANNED',
        animeTitle: 'Demon Slayer',
        animeImage: 'cover1.jpg'
      }];
      
      expect(screen.getByTestId('watchlist')).toHaveTextContent(
        JSON.stringify(updatedWatchlist)
      );
    });
  });

  it('met à jour un élément existant', async () => {
    mockGetWatchlist.mockResolvedValue(mockWatchlist);
    mockUpdateWatchlistItem.mockResolvedValue({
      ...mockWatchlist[0],
      status: 'COMPLETED'
    });
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
    
    // Mettre à jour un élément
    fireEvent.click(screen.getByText('Update Item'));
    
    await waitFor(() => {
      expect(mockUpdateWatchlistItem).toHaveBeenCalledWith(
        101, 
        { status: 'COMPLETED' }
      );
      
      // Vérifier la mise à jour
      const updatedWatchlist = [{
        ...mockWatchlist[0],
        status: 'COMPLETED'
      }];
      
      expect(screen.getByTestId('watchlist')).toHaveTextContent(
        JSON.stringify(updatedWatchlist)
      );
    });
  });

  it('supprime un élément', async () => {
    mockGetWatchlist.mockResolvedValue(mockWatchlist);
    mockRemoveFromWatchlist.mockResolvedValue();
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
    
    // Supprimer un élément
    fireEvent.click(screen.getByText('Remove Item'));
    
    await waitFor(() => {
      expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(101);
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify([]));
    });
  });

  it('rafraîchit la watchlist', async () => {
    mockGetWatchlist
      .mockResolvedValueOnce(mockWatchlist)
      .mockResolvedValueOnce([...mockWatchlist, {
          animeId: 303,
          status: 'COMPLETED',
          animeTitle: 'New Anime',
          animeImage: 'cover3.jpg',
          progress: 0
      }]);
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    // Attendre le chargement initial
    await waitFor(() => {
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
    
    // Rafraîchir la watchlist
    fireEvent.click(screen.getByText('Refresh'));
    
    // Vérifier l'état de chargement
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    
    // Attendre le nouveau chargement
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('watchlist')).toHaveTextContent(
        JSON.stringify([...mockWatchlist, {
          animeId: 303,
          status: 'COMPLETED',
          animeTitle: 'New Anime',
          animeImage: 'cover3.jpg'
        }])
      );
    });
  });

  it('gère les conflits lors de l\'ajout d\'un élément existant', async () => {
    mockGetWatchlist.mockResolvedValue(mockWatchlist);
    mockAddToWatchlist.mockRejectedValue(new Error('Cet anime est déjà dans votre watchlist'));
    
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('watchlist')).toHaveTextContent(JSON.stringify(mockWatchlist));
    });
    
    // Tenter d'ajouter un élément existant
    fireEvent.click(screen.getByText('Add Item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Cet anime est déjà dans votre watchlist');
    });
  });
});
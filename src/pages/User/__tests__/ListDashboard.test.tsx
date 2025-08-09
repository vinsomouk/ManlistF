// src/pages/User/__tests__/ListDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ListDashboard from '../ListDashboard';
import { useAuth } from '../../../hooks/useAuth';
import { WatchlistProvider, useWatchlist } from '../../../context/WatchlistContext';

// Mocks des hooks et données
vi.mock('../../../hooks/useAuth');
vi.mock('../../../context/WatchlistContext');
vi.mock('../../../components/services/anilistService');

const mockUser = {
  id: '1',
  email: 'test@user.com',
  nickname: 'TestUser',
  profilePicture: null,
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockWatchlist = [
  {
    animeId: 101,
    status: 'WATCHING' as const,
    progress: 3,
    score: 85,
    notes: 'Très bon anime',
    animeTitle: 'Demon Slayer',
    animeImage: 'cover1.jpg'
  },
  {
    animeId: 202,
    status: 'COMPLETED' as const,
    progress: 24,
    score: 92,
    notes: 'Un classique',
    animeTitle: 'Attack on Titan',
    animeImage: 'cover2.jpg'
  }
];

describe('ListDashboard Component', () => {
  const mockAddToWatchlist = vi.fn();
  const mockUpdateWatchlistItem = vi.fn();
  const mockRemoveFromWatchlist = vi.fn();
  const mockFetchWatchlist = vi.fn();

  beforeEach(() => {
    // Reset des mocks
    vi.resetAllMocks();
    
    // Configuration des mocks
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null
    });

    (useWatchlist as any).mockReturnValue({
      watchlist: mockWatchlist,
      loading: false,
      error: null,
      addToWatchlist: mockAddToWatchlist,
      updateWatchlistItem: mockUpdateWatchlistItem,
      removeFromWatchlist: mockRemoveFromWatchlist,
      fetchWatchlist: mockFetchWatchlist
    });
  });

  it('affiche la watchlist avec les éléments', async () => {
    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    // Vérifie que les titres des animés sont affichés
    expect(screen.getByText('Demon Slayer')).toBeInTheDocument();
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
    
    // Vérifie les statuts
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Terminé')).toBeInTheDocument();
  });

  it('affiche un message quand la watchlist est vide', async () => {
    // Override du mock pour une watchlist vide
    (useWatchlist as any).mockReturnValue({
      watchlist: [],
      loading: false,
      error: null
    });

    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    expect(screen.getByText('Votre watchlist est vide.')).toBeInTheDocument();
    expect(screen.getByText('Ajouter des animés populaires')).toBeInTheDocument();
  });

  it('permet d\'ajouter des animés populaires', async () => {
    // Override pour watchlist vide
    (useWatchlist as any).mockReturnValue({
      watchlist: [],
      loading: false,
      error: null,
      addToWatchlist: mockAddToWatchlist
    });

    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    const addButton = screen.getByText('Ajouter des animés populaires');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddToWatchlist).toHaveBeenCalledTimes(3);
    });
  });

  it('ouvre le modal d\'édition', async () => {
    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    const editButtons = screen.getAllByText('Modifier');
    fireEvent.click(editButtons[0]);

    // Vérifie que le modal est ouvert
    expect(screen.getByText('Modifier l\'animé')).toBeInTheDocument();
    expect(screen.getByDisplayValue('En cours')).toBeInTheDocument();
  });

  it('permet de modifier un élément de la watchlist', async () => {
    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    // Ouvrir le modal
    const editButtons = screen.getAllByText('Modifier');
    fireEvent.click(editButtons[0]);

    // Modifier les valeurs
    fireEvent.change(screen.getByLabelText('Statut:'), { target: { value: 'COMPLETED' } });
    fireEvent.change(screen.getByLabelText('Progression (épisodes):'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Note (0-100):'), { target: { value: '90' } });

    // Soumettre
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(mockUpdateWatchlistItem).toHaveBeenCalledWith(
        101, 
        {
          status: 'COMPLETED',
          progress: 10,
          score: 90
        }
      );
    });
  });

  it('permet de supprimer un élément de la watchlist', async () => {
    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    // Ouvrir le modal
    const editButtons = screen.getAllByText('Modifier');
    fireEvent.click(editButtons[0]);

    // Cliquer sur supprimer
    fireEvent.click(screen.getByText('Supprimer de la watchlist'));

    await waitFor(() => {
      expect(mockRemoveFromWatchlist).toHaveBeenCalledWith(101);
    });
  });

  it('filtre la watchlist par statut', async () => {
    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    // Changer le filtre
    const filterSelect = screen.getByLabelText('Tous les statuts');
    fireEvent.change(filterSelect, { target: { value: 'COMPLETED' } });

    // Vérifier que seul l'élément COMPLETED est visible
    expect(screen.queryByText('Demon Slayer')).not.toBeInTheDocument();
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
  });

  it('affiche un indicateur de chargement', async () => {
    // Override pour état de chargement
    (useWatchlist as any).mockReturnValue({
      watchlist: [],
      loading: true,
      error: null
    });

    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    expect(screen.getByText('Chargement initial...')).toBeInTheDocument();
  });

  it('gère les erreurs de chargement', async () => {
    // Override pour erreur
    (useWatchlist as any).mockReturnValue({
      watchlist: [],
      loading: false,
      error: 'Erreur de chargement de la watchlist'
    });

    render(
      <WatchlistProvider>
        <ListDashboard />
      </WatchlistProvider>
    );

    expect(screen.getByText('Erreur: Erreur de chargement de la watchlist')).toBeInTheDocument();
  });
});
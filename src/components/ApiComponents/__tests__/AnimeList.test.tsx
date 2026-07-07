import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AnimeList from '../AnimeList';

// Mock du fichier CSS
jest.mock('../../../styles/Animes/AnimeList.css', () => ({}));

// Mock du service
jest.mock('../../services/anilistService', () => ({
  fetchPopularAnime: jest.fn()
}));

const { fetchPopularAnime } = require('../../services/anilistService');

const mockAnimes = [
  {
    id: 1,
    title: { romaji: 'Demon Slayer', english: 'Demon Slayer' },
    coverImage: { large: 'cover1.jpg' },
    averageScore: 85,
    genres: ['Action', 'Fantasy']
  },
  {
    id: 2,
    title: { romaji: 'Attack on Titan', english: 'Attack on Titan' },
    coverImage: { large: 'cover2.jpg' },
    averageScore: 90,
    genres: ['Action', 'Drama']
  }
];

describe('AnimeList Component', () => {
  beforeEach(() => {
    fetchPopularAnime.mockClear();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('affiche les animés au chargement initial', async () => {
    fetchPopularAnime.mockResolvedValue({
      data: mockAnimes,
      pageInfo: { hasNextPage: false }
    });

    const container = document.getElementById('root') as HTMLElement;
    render(<AnimeList searchQuery="" filters={{}} />, { container });

    await waitFor(() => {
      expect(screen.getByText('Demon Slayer')).toBeInTheDocument();
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
    });
  });

  it('gère correctement les erreurs de l\'API', async () => {
    fetchPopularAnime.mockRejectedValue(new Error('API Error'));

    const container = document.getElementById('root') as HTMLElement;
    render(<AnimeList searchQuery="" filters={{}} />, { container });

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  it('permet de réessayer après une erreur', async () => {
    fetchPopularAnime
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        data: mockAnimes,
        pageInfo: { hasNextPage: false }
      });

    const container = document.getElementById('root') as HTMLElement;
    render(<AnimeList searchQuery="" filters={{}} />, { container });

    const retryButton = await screen.findByText('Réessayer');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(fetchPopularAnime).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Demon Slayer')).toBeInTheDocument();
    });
  });

  it('applique les filtres correctement', async () => {
    fetchPopularAnime.mockResolvedValue({
      data: mockAnimes,
      pageInfo: { hasNextPage: false }
    });

    const container = document.getElementById('root') as HTMLElement;
    render(<AnimeList searchQuery="demon" filters={{ genre: ['Action'] }} />, { container });

    await waitFor(() => {
      expect(fetchPopularAnime).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'demon',
          genre: ['Action']
        })
      );
    });
  });
});

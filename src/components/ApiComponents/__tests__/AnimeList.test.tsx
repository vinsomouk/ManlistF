// src/components/ApiComponents/AnimeList.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AnimeList from '../AnimeList';
import { fetchPopularAnime } from '../../services/anilistService';

jest.mock('../../services/anilistService');

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
    (fetchPopularAnime as jest.Mock).mockClear();
  });

  it('affiche les animés au chargement initial', async () => {
    (fetchPopularAnime as jest.Mock).mockResolvedValue({
      data: mockAnimes,
      pageInfo: { hasNextPage: false }
    });

    render(<AnimeList searchQuery="" filters={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Demon Slayer')).toBeInTheDocument();
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
    });
  });

  it('gère correctement les erreurs de l\'API', async () => {
    (fetchPopularAnime as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<AnimeList searchQuery="" filters={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  it('permet de réessayer après une erreur', async () => {
    (fetchPopularAnime as jest.Mock)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValue({
        data: mockAnimes,
        pageInfo: { hasNextPage: false }
      });

    render(<AnimeList searchQuery="" filters={{}} />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Réessayer'));
    });

    await waitFor(() => {
      expect(fetchPopularAnime).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Demon Slayer')).toBeInTheDocument();
    });
  });

  it('applique les filtres correctement', async () => {
    (fetchPopularAnime as jest.Mock).mockResolvedValue({
      data: mockAnimes,
      pageInfo: { hasNextPage: false }
    });

    render(<AnimeList searchQuery="demon" filters={{ genre: ['Action'] }} />);
    
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
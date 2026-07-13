import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchPopularAnime } from '../services/anilistService';
import type {
  Anime,
  PageInfo,
  FetchOptions,
} from '../services/anilistService';
import '../../styles/Animes/AnimeList.css';

interface AnimeListProps {
  searchQuery: string;
  filters: FetchOptions;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const AnimeList: React.FC<AnimeListProps> = ({
  searchQuery,
  filters,
}) => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
  });

  const loadingRef = useRef(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const loadData = useCallback(
    async (isNewSearch = false) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const currentPage = isNewSearch ? 1 : page;

        const {
          data,
          pageInfo: newPageInfo,
        } = await fetchPopularAnime({
          page: currentPage,
          perPage: 20,
          search: debouncedSearch.trim() || undefined,
          ...debouncedFilters,
        });

        setAnimes((previousAnimes) => {
          if (isNewSearch) {
            return data ?? [];
          }

          const newAnimes =
            data?.filter(
              (anime) =>
                !previousAnimes.some(
                  (existingAnime) => existingAnime.id === anime.id,
                ),
            ) ?? [];

          return [...previousAnimes, ...newAnimes];
        });

        setPageInfo(newPageInfo);
      } catch (caughtError) {
        console.error('Erreur:', caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Erreur de chargement',
        );

        setAnimes([]);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [page, debouncedSearch, debouncedFilters],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight +
          document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500;

      if (
        isNearBottom &&
        !loadingRef.current &&
        pageInfo.hasNextPage
      ) {
        setPage((previousPage) => previousPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageInfo.hasNextPage]);

  useEffect(() => {
    setPage(1);
    void loadData(true);
  }, [debouncedSearch, debouncedFilters, loadData]);

  useEffect(() => {
    if (page > 1) {
      void loadData(false);
    }
  }, [page, loadData]);

  return (
    <div className="anime-app-container">
      {error && (
        <div className="error-state">
          <p className="error-message">{error}</p>

          <button
            onClick={() => void loadData(true)}
            className="refresh-button"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="anime-grid">
        {animes.map((anime) => (
          <div key={anime.id} className="anime-grid-item">
            <Link
              to={`/anime/${anime.id}`}
              className="anime-card"
            >
              <div className="anime-card-image-container">
                {anime.coverImage?.large ? (
                  <img
                    src={anime.coverImage.large}
                    alt={
                      anime.title?.english ||
                      anime.title?.romaji ||
                      'Cover'
                    }
                    loading="lazy"
                    decoding="async"
                    className="anime-card-image"
                  />
                ) : (
                  <div className="anime-card-placeholder">
                    No Image
                  </div>
                )}
              </div>

              <div className="anime-card-content">
                <h3 className="anime-title">
                  {anime.title?.english ||
                    anime.title?.romaji ||
                    'Titre inconnu'}
                </h3>

                <div className="anime-meta">
                  <span>⭐ {anime.averageScore || 'N/A'}</span>

                  <p>
                    {anime.genres?.join(' • ') ||
                      'Genres non disponibles'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-spinner">Chargement...</div>
      )}

      {!loading && animes.length === 0 && !error && (
        <div className="no-results">
          <p>Aucun anime trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AnimeList;
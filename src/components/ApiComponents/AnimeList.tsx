import { useState, useEffect, useCallback } from 'react';
import { fetchPopularAnime } from '../services/anilistService';
import type { Anime, PageInfo, FetchOptions } from '../services/anilistService';
import Sidebar from '../MainComponents/SideBar';
import '../../styles/AnimeList.css';

const AnimeList = () => {
  // États
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false
  });
  const [filters, setFilters] = useState<FetchOptions>({});

  // Debounce pour optimiser les requêtes
  const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Fonction principale de chargement
  const loadData = useCallback(async (isNewSearch: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = isNewSearch ? 1 : page;
      const { data, pageInfo: newPageInfo } = await fetchPopularAnime({
        page: currentPage,
        perPage: 20,
        search: debouncedSearch.trim() || undefined,
        ...debouncedFilters
      });

      setAnimes(prev => 
        isNewSearch 
          ? data || []
          : [...prev, ...data?.filter(a => !prev.some(b => b.id === a.id)) || []]
      );
      
      setPageInfo(newPageInfo);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setAnimes([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, debouncedFilters, loading]);

  // Gestion du scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 &&
        !loading && 
        pageInfo.hasNextPage
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, pageInfo.hasNextPage]);

  // Effet pour recherche et filtres
  useEffect(() => {
    loadData(true);
    setPage(1);
  }, [debouncedSearch, debouncedFilters]);

  // Effet pour pagination
  useEffect(() => {
    if (page > 1) {
      loadData(false);
    }
  }, [page]);

  // Fonction de recherche
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Fonction de changement de filtres
  const handleFiltersChange = useCallback((newFilters: FetchOptions) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="anime-app-container">
      <Sidebar 
        onSearch={handleSearch} 
        onFiltersChange={handleFiltersChange} 
      />
      
      <main className="main-content">
        <h1 className="page-title">
          {searchQuery ? `Résultats pour "${searchQuery}"` : 'Animes populaires'}
        </h1>

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={() => loadData(true)} className="refresh-button">
              Réessayer
            </button>
          </div>
        )}

        <div className="anime-grid">
          {animes.map(anime => (
            <div className="anime-card" key={anime.id}>
              <div className="anime-card-image-container">
                {anime.coverImage?.large ? (
                  <img 
                    src={anime.coverImage.large} 
                    alt={anime.title?.romaji || 'Cover'} 
                    loading="lazy"
                  />
                ) : (
                  <div className="anime-card-placeholder">No Image</div>
                )}
              </div>
              <div className="anime-card-content">
                <h3>{anime.title?.romaji || 'Titre inconnu'}</h3>
                <div className="anime-meta">
                  <span>⭐ {anime.averageScore || 'N/A'}</span>
                  <p>{anime.genres?.join(' • ') || 'Genres non disponibles'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="loading-spinner">Chargement...</div>}

        {!loading && animes.length === 0 && !error && (
          <div className="no-results">
            <p>Aucun anime trouvé</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimeList;
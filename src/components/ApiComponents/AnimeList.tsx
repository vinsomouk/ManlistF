import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPopularAnime } from '../services/anilistService';
import type { Anime } from '../services/anilistService';
import Sidebar from '../MainComponents/SideBar';
import '../../styles/AnimeList.css';

const AnimeList = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoadingRef = useRef(false);

  const loadData = useCallback(async (reset = false) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const { data, pageInfo } = await fetchPopularAnime({ 
        page: currentPage, 
        perPage: 20,
        search: searchQuery || undefined
      });

      setAnimes(prev => {
        if (reset) return data || [];
        
        const existingIds = new Set(prev.map(a => a.id));
        const newItems = (data || []).filter(anime => 
          anime && !existingIds.has(anime.id)
        );
        return [...prev, ...newItems];
      });

      setHasMore(pageInfo?.hasNextPage ?? false);
      if (reset) setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setHasMore(false);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [page, searchQuery]);

  // Initial load and search refresh
  useEffect(() => {
    loadData(true);
  }, [searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 500;
      const isNearBottom = (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - scrollThreshold
      );

      if (isNearBottom && !loading && hasMore && !isLoadingRef.current) {
        setPage(p => p + 1);
      }
    };

    const debouncedScroll = debounce(handleScroll, 200);
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, [loading, hasMore]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleSearch = useCallback((term: string) => {
    setSearchQuery(term.trim());
  }, []);

  return (
    <div className="anime-app-container">
      <Sidebar 
        onRefresh={handleRefresh}
        onSearch={handleSearch}
      />
      
      <main className="main-content">
        <h1 className="page-title">
          {searchQuery ? `Résultats pour "${searchQuery}"` : 'Animes Populaires'}
        </h1>

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button 
              className="refresh-button"
              onClick={handleRefresh}
            >
              Réessayer
            </button>
          </div>
        )}

        {loading && animes.length === 0 ? (
          <div className="initial-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="anime-grid">
              {animes.map(anime => (
                <div key={`${anime.id}-${searchQuery}`} className="anime-card">
                  {anime.coverImage?.large ? (
                    <img 
                      className="anime-card-image" 
                      src={anime.coverImage.large} 
                      alt={anime.title?.romaji || 'Cover'} 
                      loading="lazy"
                    />
                  ) : (
                    <div className="anime-card-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="anime-card-content">
                    <h3 className="anime-title">{anime.title?.romaji || 'Titre inconnu'}</h3>
                    <div className="anime-meta">
                      <span className="anime-score">⭐ {anime.averageScore || 'N/A'}</span>
                      <p className="anime-genres">{anime.genres?.join(' • ') || 'Genres non disponibles'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
              </div>
            )}

            {!hasMore && !loading && animes.length > 0 && (
              <p className="end-message">Fin des résultats</p>
            )}

            {!loading && animes.length === 0 && !error && (
              <div className="no-results">
                <div className="no-results-icon">🎌</div>
                <p>Aucun anime trouvé</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

function debounce(func: () => void, wait: number) {
  let timeout: number;
  return () => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(func, wait);
  };
}

export default AnimeList;
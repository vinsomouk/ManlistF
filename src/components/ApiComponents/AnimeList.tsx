import { useState, useEffect, useCallback } from 'react';
import { fetchPopularAnime } from '../services/anilistService';
import type { Anime } from '../services/anilistService';
import Sidebar from '../MainComponents/SideBar';
import '../../styles/AnimeList.css';

const AnimeList = () => {
  // États
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fonction de chargement
  const loadData = useCallback(async () => {
    try {
      console.log(`Chargement page ${page}...`); // Debug
      const { data, pageInfo } = await fetchPopularAnime({
        page,
        perPage: 20,
        search: searchQuery || undefined
      });

      console.log('Données reçues:', data); // Debug

      setAnimes(prev => {
        // Évite les doublons
        const newItems = data?.filter(anime => 
          !prev.some(a => a.id === anime.id)
        ) || [];
        return [...prev, ...newItems];
      });

      setHasMore(pageInfo?.hasNextPage ?? false);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err); // Debug
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    loadData();
  }, [searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // Recharge quand la page change
  useEffect(() => {
    if (page > 1) {
      setLoading(true);
      loadData();
    }
  }, [page]);

  // Debug
  useEffect(() => {
    console.log('État actuel:', {
      animés: animes.length,
      chargement: loading,
      erreur: error,
      page,
      aPlus: hasMore
    });
  }, [animes, loading, error, page, hasMore]);

  return (
    <div className="anime-app-container">
      <Sidebar onSearch={setSearchQuery} />
      
      <main className="main-content">
        <h1 className="page-title">
          {searchQuery ? `Résultats pour "${searchQuery}"` : ''}
        </h1>

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button 
              className="refresh-button"
              onClick={() => {
                setPage(1);
                setLoading(true);
                loadData();
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        <div className="anime-grid">
          {animes.map(anime => (
            <div className="anime-card">
  <div className="anime-card-image-container">
    {anime.coverImage?.large ? (
      <img 
        className="anime-card-image" 
        src={anime.coverImage.large} 
        alt={anime.title?.romaji || 'Cover'} 
      />
    ) : (
      <div className="anime-card-placeholder">
        <span>No Image</span>
      </div>
    )}
  </div>
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
            Chargement...
          </div>
        )}

        {!hasMore && !loading && animes.length > 0 && (
          <p className="end-message">Fin des résultats</p>
        )}

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
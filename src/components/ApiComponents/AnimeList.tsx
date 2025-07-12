import { useState, useEffect, useCallback } from 'react';
import { fetchPopularAnime } from '../services/anilistService';
import type { Anime } from '../services/anilistService';
import Sidebar from '../MainComponents/SideBar';
import '../../styles/AnimeList.css';

const AnimeList = () => {
  // États
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Fonction optimisée pour la recherche
  const handleSearch = useCallback(async (query: string) => {
  console.log('Lancement recherche avec:', query);
  setSearchQuery(query);
  setLoading(true);
  setError(null);

  try {
    const { data } = await fetchPopularAnime({
      page: 1,
      perPage: 20,
      search: query.trim() || undefined // Important: undefined plutôt que chaîne vide
    });
    
    setAnimes(data || []);
  } catch (err) {
    console.error('Erreur lors de la recherche:', err);
    setError('Erreur de recherche - voir console');
    setAnimes([]);
  } finally {
    setLoading(false);
  }
}, []);

  // Effet pour le chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialLoad) {
        console.log('[AnimeList] Chargement initial');
        setLoading(true);
        try {
          const { data } = await fetchPopularAnime({
            page: 1,
            perPage: 20
          });
          console.log('[AnimeList] Données initiales reçues:', data?.length || 0);
          setAnimes(data || []);
        } catch (err) {
          console.error('[AnimeList] Erreur chargement initial:', err);
          setError('Erreur au chargement initial. Voir la console.');
        } finally {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    loadInitialData();
  }, [initialLoad]);

  // Réinitialisation quand la recherche est vide
  useEffect(() => {
    if (searchQuery === '' && !initialLoad) {
      console.log('[AnimeList] Recherche vide, réinitialisation');
      handleSearch('');
    }
  }, [searchQuery, initialLoad, handleSearch]);

  return (
    <div className="anime-app-container">
      <Sidebar onSearch={handleSearch} />
      
      <main className="main-content">
        <h1 className="page-title">
          {searchQuery ? `Résultats pour "${searchQuery}"` : 'Animes populaires'}
        </h1>

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button 
              className="refresh-button"
              onClick={() => initialLoad ? window.location.reload() : handleSearch(searchQuery)}
            >
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

        {loading && <div className="loading-state">Chargement...</div>}

        {!initialLoad && !loading && animes.length === 0 && !error && (
          <div className="no-results">
            <p>Aucun anime trouvé</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimeList;
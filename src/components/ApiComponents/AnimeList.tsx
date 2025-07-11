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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fonction de chargement
  const loadData = useCallback(async () => {
    setLoading(true); // Commence le chargement
    setError(null); // Réinitialise l'erreur
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
      setHasMore(false); // Pas de pages supplémentaires si une erreur se produit
    } finally {
      setLoading(false); // Fin du chargement
    }
  }, [page, searchQuery]);

 useEffect(() => {
  loadData();
}, [searchQuery]); // Recharge les données lorsque la requête de recherche change

useEffect(() => {
  console.log(`Page actuelle: ${page}`); // Debug
  loadData(); // Recharge les données lorsque la page change
}, [page]);
 // Recharge les données lorsque la requête de recherche change

  // Fonction pour charger la page suivante
  const loadMore = () => {
    console.log('Chargement de la page suivante...');
    if (!loading && hasMore) {
      setPage(prev => prev + 1); // Charge la page suivante
    }
  };

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
                setPage(1); // Réinitialise la page
                loadData(); // Recharge les données
              }}
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

        {/* Bouton pour charger plus d'animes */}
        <button onClick={loadMore} disabled={loading || !hasMore}>
          {loading ? 'Chargement...' : 'Charger plus'}
        </button>
      </main>
    </div>
  );
};

export default AnimeList;

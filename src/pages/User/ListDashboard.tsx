import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchPopularAnime } from '../../components/services/anilistService';
import { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist,  } from '../../components/services/anilistService';
import type { WatchStatus } from '../../components/services/anilistService';
import type { Anime, WatchlistItem } from '../../components/services/anilistService';
import Header from "../../components/MainComponents/Header";
import '../../styles/Animes/Watchlist.css';

const statusOptions: { value: WatchStatus; label: string }[] = [
  { value: 'WATCHING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'DROPPED', label: 'Abandonné' },
  { value: 'PLANNED', label: 'Prévu' }
];

function ListDashboard() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'ALL'>('ALL');
  const [initialLoad, setInitialLoad] = useState(true); // Nouvel état

  const handleAddFromPopular = async () => {
  if (!user) return;
  
  try {
    setLoading(true);
    const popularAnime = await fetchPopularAnime({ perPage: 3 });
    const animeToAdd = popularAnime.data.filter(anime => 
      !watchlist.some(item => item.animeId === anime.id)
    );

    for (const anime of animeToAdd) {
      await handleAddToWatchlist(anime.id);
    }
  } catch (err) {
    console.error('Failed to add popular anime:', err);
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
    const loadData = async () => {
      if (!user || !initialLoad) return; // Ne pas recharger après la première fois
      
      try {
        setLoading(true);
        const [watchlistData] = await Promise.all([
          getWatchlist()
        ]);
        
        setWatchlist(watchlistData);
        setInitialLoad(false); // Marquer le premier chargement comme terminé
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, initialLoad]); // Dépendances correctes

  if (loading && initialLoad) {
    return <div>Chargement initial...</div>;
  }
  // Modifiez d'abord les appels dans le composant :

const handleAddToWatchlist = async (animeId: number) => {
  if (!user) return;
  
  try {
    const newItem = await addToWatchlist({ // Plus besoin de passer userId
      animeId,
      status: 'PLANNED',
      progress: 0
    });
    setWatchlist(prev => [...prev, newItem]);
  } catch (err) {
    console.error('Failed to add to watchlist:', err);
  }
};

const handleStatusChange = async (animeId: number, newStatus: WatchStatus) => {
  if (!user) return;
  
  try {
    const updatedItem = await updateWatchlistItem(animeId, { // Plus besoin de userId
      status: newStatus
    });
    setWatchlist(prev => prev.map(item => 
      item.animeId === animeId ? updatedItem : item
    ));
  } catch (err) {
    console.error('Failed to update status:', err);
  }
};

const handleProgressChange = async (animeId: number, newProgress: number) => {
  if (!user) return;
  
  try {
    const updatedItem = await updateWatchlistItem(animeId, { // Plus besoin de userId
      progress: newProgress
    });
    setWatchlist(prev => prev.map(item => 
      item.animeId === animeId ? updatedItem : item
    ));
  } catch (err) {
    console.error('Failed to update progress:', err);
  }
};

const handleRemoveFromWatchlist = async (animeId: number) => {
  if (!user) return;
  
  try {
    await removeFromWatchlist(animeId); // Plus besoin de userId
    setWatchlist(prev => prev.filter(item => item.animeId !== animeId));
  } catch (err) {
    console.error('Failed to remove from watchlist:', err);
  }
};

  const filteredWatchlist = statusFilter === 'ALL' 
    ? watchlist 
    : watchlist.filter(item => item.status === statusFilter);

  const getAnimeById = (id: number) => animes.find(anime => anime.id === id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="watchlist-container">
      <Header />
      
      <div className="watchlist-header">
        <h1>Ma Watchlist</h1>
        
        <div className="status-filter">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as WatchStatus | 'ALL')}
          >
            <option value="ALL">Tous les statuts</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="watchlist-grid">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map(item => {
            const anime = getAnimeById(item.animeId);
            if (!anime) return null;

            return (
              <div key={item.animeId} className="watchlist-item">
                <div className="anime-card">
                  <img 
                    src={anime.coverImage?.large} 
                    alt={anime.title?.romaji} 
                  />
                  <h3>{anime.title?.romaji}</h3>
                </div>
                
                <div className="watchlist-controls">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.animeId, e.target.value as WatchStatus)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="progress-control">
                    <label>Épisodes:</label>
                    <input
                      type="number"
                      min="0"
                      max={anime.episodes || 100}
                      value={item.progress}
                      onChange={(e) => handleProgressChange(item.animeId, parseInt(e.target.value))}
                    />
                    <span>/ {anime.episodes || '?'}</span>
                  </div>
                  
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveFromWatchlist(item.animeId)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-watchlist">
            {statusFilter === 'ALL' && (
        <button 
          onClick={() => handleAddFromPopular()}
          className="add-from-popular-btn"
        >
          Ajouter des animés populaires
        </button>
      )
              ? 'Votre watchlist est vide. Ajoutez des animés depuis la page principale!'
              : `Aucun animé avec le statut "${statusOptions.find(o => o.value === statusFilter)?.label}"`}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListDashboard;
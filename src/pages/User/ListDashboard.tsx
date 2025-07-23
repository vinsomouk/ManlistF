import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchPopularAnime } from '../../components/services/anilistService';
import Header from "../../components/MainComponents/Header";
import '../../styles/Animes/Watchlist.css';
import { useWatchlist } from '../../context/WatchlistContext';

const statusOptions = [
  { value: 'WATCHING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'DROPPED', label: 'Abandonné' },
  { value: 'PLANNED', label: 'Prévu' }
] as const;

function ListDashboard() {
  const { user } = useAuth();
  const { 
    watchlist, 
    loading, 
    error,
    addToWatchlist,
    updateWatchlistStatus,
    updateWatchlistProgress,
    removeFromWatchlist,
    fetchWatchlist
  } = useWatchlist();
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [initialLoad, setInitialLoad] = useState(true);

  const handleAddFromPopular = async () => {
    if (!user) return;
    
    try {
      const popularAnime = await fetchPopularAnime({ perPage: 3 });
      const animeToAdd = popularAnime.data.filter(anime => 
        !watchlist.some(item => item.animeId === anime.id)
      );

      for (const anime of animeToAdd) {
        await addToWatchlist(anime.id);
      }
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to add popular anime:', err);
    }
  };

  useEffect(() => {
    if (user && initialLoad) {
      setInitialLoad(false);
      fetchWatchlist();
    }
  }, [user, initialLoad, fetchWatchlist]);

  if (loading && initialLoad) return <div>Chargement initial...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredWatchlist = statusFilter === 'ALL' 
    ? watchlist 
    : watchlist.filter(item => item.status === statusFilter);

  return (
    <div className="watchlist-container">
      <Header />
      
      <div className="watchlist-header">
        <h1>Ma Watchlist</h1>
        
        <div className="status-filter">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
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
          filteredWatchlist.map(item => (
            <div key={item.animeId} className="watchlist-item">
              <div className="anime-card">
                <h3>Anime ID: {item.animeId}</h3>
              </div>
              
              <div className="watchlist-controls">
                <select
                  value={item.status}
                  onChange={(e) => updateWatchlistStatus(
                    item.animeId, 
                    e.target.value as typeof statusOptions[number]['value']
                  )}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <div className="progress-control">
                  <input
                    type="number"
                    value={item.progress}
                    onChange={(e) => updateWatchlistProgress(
                      item.animeId, 
                      parseInt(e.target.value)
                    )}
                  />
                </div>
                
                <button 
                  onClick={() => removeFromWatchlist(item.animeId)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-watchlist">
            {statusFilter === 'ALL' && (
              <button 
                onClick={handleAddFromPopular}
                className="add-from-popular-btn"
              >
                Ajouter des animés populaires
              </button>
            )}
            {statusFilter === 'ALL' 
              ? 'Votre watchlist est vide. Ajoutez des animés depuis la page principale!'
              : `Aucun animé avec le statut "${statusOptions.find(o => o.value === statusFilter)?.label}"`}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListDashboard;
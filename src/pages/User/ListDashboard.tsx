import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchPopularAnime } from '../../components/services/anilistService';
import Header from "../../components/MainComponents/Header";
import '../../styles/Animes/Watchlist.css';
import { useWatchlist } from '../../context/WatchlistContext';
import { type WatchStatus } from '../../components/services/anilistService';

const statusOptions = [
  { value: 'WATCHING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'DROPPED', label: 'Abandonné' },
  { value: 'PLANNED', label: 'Prévu' }
] as const;

function ListDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    watchlist, 
    loading, 
    error,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    fetchWatchlist
  } = useWatchlist();
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [initialLoad, setInitialLoad] = useState(true);
  const [editModalData, setEditModalData] = useState<{
    animeId: number;
    status: WatchStatus;
    progress: number;
    score?: number;
    notes?: string;
    animeTitle?: string;
    animeImage?: string;
  } | null>(null);

  const handleAddFromPopular = async () => {
    if (!user) return;
    
    try {
      const popularAnime = await fetchPopularAnime({ perPage: 3 });
      const animeToAdd = popularAnime.data.filter(anime => 
        !watchlist.some(item => item.animeId === anime.id)
      );

      for (const anime of animeToAdd) {
        await addToWatchlist({
          animeId: anime.id,
          status: 'PLANNED',
          progress: 0,
          score: 0
        });
      }
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to add popular anime:', err);
    }
  };

  const handleUpdateItem = async () => {
    if (!editModalData) return;
    
    try {
      await updateWatchlistItem(editModalData.animeId, {
        status: editModalData.status,
        progress: editModalData.progress,
        score: editModalData.score,
        notes: editModalData.notes
      });
      
      setEditModalData(null);
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to update item:', err);
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
            <div key={`${item.animeId}-${item.status}`} className="watchlist-item">
              {/* Changement de classe ici */}
              <div className="anime-info-header watchlist-anime-card">
                {item.animeImage && (
                  <img 
                    src={item.animeImage} 
                    alt={item.animeTitle || `Anime ${item.animeId}`} 
                    onClick={() => navigate(`/anime/${item.animeId}`)}
                  />
                )}
                <div>
                  <h3 onClick={() => navigate(`/anime/${item.animeId}`)}>
                    {item.animeTitle || `Anime ID: ${item.animeId}`}
                  </h3>
                  {item.score !== undefined && (
                    <div className="anime-rating">
                      ★ {item.score}/100
                    </div>
                  )}
                </div>
              </div>
              
              <div className="watchlist-controls">
                <div className="status-display">
                  {statusOptions.find(o => o.value === item.status)?.label}
                </div>
                
                <div className="progress-display">
                  Épisode: {item.progress}
                </div>
                
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditModalData(item);
                  }}
                >
                  Modifier
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

      {editModalData && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Modifier l'animé</h2>
            <span className="close" onClick={() => setEditModalData(null)}>&times;</span>
            
            <div className="form-group">
              <label>Statut:</label>
              <select
                value={editModalData.status}
                onChange={(e) => setEditModalData({
                  ...editModalData, 
                  status: e.target.value as WatchStatus
                })}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Progression (épisodes):</label>
              <input
                type="number"
                min="0"
                value={editModalData.progress}
                onChange={(e) => setEditModalData({
                  ...editModalData, 
                  progress: Number(e.target.value) || 0
                })}
              />
            </div>

            <div className="form-group">
              <label>Note (0-100):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editModalData.score || 0}
                onChange={(e) => setEditModalData({
                  ...editModalData, 
                  score: Number(e.target.value) || 0
                })}
              />
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={editModalData.notes || ''}
                onChange={(e) => setEditModalData({
                  ...editModalData, 
                  notes: e.target.value
                })}
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="delete-btn"
                onClick={() => {
                  removeFromWatchlist(editModalData.animeId);
                  setEditModalData(null);
                }}
              >
                Supprimer de la watchlist
              </button>
              <button 
                onClick={handleUpdateItem}
                className="confirm-btn"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListDashboard;
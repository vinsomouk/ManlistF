import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  fetchAnimeDetails, 
  type WatchStatus,
  type AnimeDetails,
  type StaffEdge,
  type CharacterEdge,
  type Ranking
} from '../../components/services/anilistService';
import Header from '../../components/MainComponents/Header';
import '../../styles/Animes/AnimeDetails.css';
import { useAuth } from '../../hooks/useAuth';
import { useWatchlist } from '../../context/WatchlistContext';

const statusOptions = [
  { value: 'WATCHING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'DROPPED', label: 'Abandonné' },
  { value: 'PLANNED', label: 'Prévu' }
] as const;

function AnimesInformations() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { watchlist, addToWatchlist } = useWatchlist();
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlistData, setWatchlistData] = useState({
    status: 'PLANNED' as WatchStatus,
    progress: 0,
    score: 0,
    notes: ''
  });

  useEffect(() => {
    const loadAnimeDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchAnimeDetails(Number(id));
        setAnime(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    loadAnimeDetails();
  }, [id]);

  const handleAddToWatchlist = async () => {
    if (!anime) return;
    
    try {
      await addToWatchlist({
        animeId: anime.id,
        status: watchlistData.status,
        progress: watchlistData.progress,
        score: watchlistData.score,
        notes: watchlistData.notes
      });
      setShowWatchlistModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to watchlist');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!anime) return <div className="not-found">Anime not found</div>;

  const isInWatchlist = watchlist.some(item => item.animeId === anime.id);

  return (
    <div className="anime-details-container">
      <Header />
      
      {anime.bannerImage && (
        <div className="banner" style={{ backgroundImage: `url(${anime.bannerImage})` }} />
      )}

      <div className="content-wrapper">
        <div className="main-info">
          <div className="cover-image">
            <img src={anime.coverImage?.large} alt={anime.title?.romaji || 'Anime cover'} />
          </div>

          <div className="details">
            <h1>{anime.title?.romaji}</h1>
            <div className="meta">
              <span>Score: {anime.averageScore || 'N/A'}</span>
              <span>Status: {anime.status || 'Unknown'}</span>
              <span>Episodes: {anime.episodes || 'Unknown'}</span>
              <span>Duration: {anime.duration || 'Unknown'} min</span>
            </div>
            
            <div className="genres">
              {anime.genres?.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>

            {user && (
              <button 
                onClick={() => setShowWatchlistModal(true)}
                disabled={isInWatchlist}
                className={`add-to-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}`}
              >
                {isInWatchlist ? 'Déjà dans la watchlist' : 'Ajouter à ma watchlist'}
              </button>
            )}
          </div>
        </div>

        <div className="description">
          <h2>Synopsis</h2>
          <p dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }} />
        </div>

        {anime.staff?.edges && anime.staff.edges.length > 0 && (
          <div className="staff-section">
            <h2>Staff</h2>
            <div className="staff-grid">
              {anime.staff.edges.map(({ role, node }) => (
                <div key={node.id} className="staff-card">
                  <img 
                    src={node.image?.large || '/placeholder-staff.jpg'} 
                    alt={node.name?.full || 'Staff member'} 
                  />
                  <div>
                    <h3>{node.name?.full}</h3>
                    <p>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {anime.characters?.edges && anime.characters.edges.length > 0 && (
          <div className="main-characters-section">
            <h2>Personnages Principaux</h2>
            <div className="characters-grid">
              {anime.characters.edges.map(edge => (
                <div key={edge.node.id} className="character-card">
                  <img 
                    src={edge.node.image?.large || '/placeholder-character.jpg'} 
                    alt={edge.node.name?.full || 'Character'} 
                  />
                  <div>
                    <h3>{edge.node.name?.full}</h3>
                    <p>Rôle: {edge.role || 'Inconnu'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {anime.characters?.edges && anime.characters.edges.length > 0 && (
          <div className="voice-actors-section">
            <h2>Doubleurs</h2>
            <div className="voice-actors-grid">
              {anime.characters.edges.flatMap(edge => 
                edge.voiceActors.map(actor => (
                  <div key={`${edge.node.id}-${actor.id}`} className="voice-actor-card">
                    <img 
                      src={actor.image?.large || '/placeholder-actor.jpg'} 
                      alt={actor.name?.full || 'Voice actor'} 
                    />
                    <div>
                      <h3>{actor.name?.full}</h3>
                      <p>Double: {edge.node.name?.full}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {anime.rankings && anime.rankings.length > 0 && (
          <div className="rankings-section">
            <h2>Classements</h2>
            <ul>
              {anime.rankings.map(ranking => (
                <li key={ranking.id}>
                  #{ranking.rank} - {ranking.context} {ranking.year && `(${ranking.year})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showWatchlistModal && (
        <div className="watchlist-modal">
          <div className="modal-content">
            <h2>Ajouter à ma watchlist</h2>
            <span className="close" onClick={() => setShowWatchlistModal(false)}>&times;</span>
            
            <div className="form-group">
              <label>Statut:</label>
              <select
                value={watchlistData.status}
                onChange={(e) => setWatchlistData({
                  ...watchlistData, 
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
                max={anime.episodes || 100}
                value={watchlistData.progress}
                onChange={(e) => setWatchlistData({
                  ...watchlistData, 
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
                value={watchlistData.score}
                onChange={(e) => setWatchlistData({
                  ...watchlistData, 
                  score: Number(e.target.value) || 0
                })}
              />
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={watchlistData.notes}
                onChange={(e) => setWatchlistData({
                  ...watchlistData, 
                  notes: e.target.value
                })}
                rows={3}
                maxLength={500}
              />
            </div>

            <button 
              onClick={handleAddToWatchlist}
              className="confirm-btn"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimesInformations;
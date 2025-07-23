import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAnimeDetails } from '../../components/services/anilistService';
import type { Anime } from '../../components/services/anilistService';
import Header from '../../components/MainComponents/Header';
import '../../styles/Animes/AnimeDetails.css';
import { useAuth } from '../../hooks/useAuth';
import { useWatchlist } from '../../context/WatchlistContext';

interface RelationEdge {
  relationType: string;
  node: {
    id: number;
    title?: {
      romaji?: string;
    };
    coverImage?: {
      large?: string;
    };
  };
}

interface Character {
  id: number;
  image: {
    large: string;
  };
  name: {
    full?: string;
  };
}

function AnimesInformations() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { watchlist, addToWatchlist } = useWatchlist();

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
      await addToWatchlist(anime.id);
      alert('Anime ajouté à la watchlist!');
    } catch (err) {
      const error = err as Error;
      alert(error.message);
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
            <img src={anime.coverImage?.large} alt={anime.title?.romaji} />
          </div>

          {user && (
            <button 
              onClick={handleAddToWatchlist}
              disabled={isInWatchlist}
              className={`add-to-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}`}
            >
              {isInWatchlist ? 'Déjà dans la watchlist' : 'Ajouter à ma watchlist'}
            </button>
          )}
          
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
          </div>
        </div>

        <div className="description">
          <h2>Synopsis</h2>
          <p dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }} />
        </div>

        {anime.characters?.nodes.length > 0 && (
          <div className="characters-section">
            <h2>Personnages principaux</h2>
            <div className="characters-grid">
              {anime.characters.nodes.map((character: Character) => (
                <div key={character.id} className="character-card">
                  <img 
                    src={character.image.large} 
                    alt={character.name.full || 'Character image'} 
                  />
                  <p>{character.name.full}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {anime.relations?.edges.length > 0 && (
          <div className="relations-section">
            <h2>Relations</h2>
            <div className="relations-grid">
              {anime.relations.edges.map(({ relationType, node }: RelationEdge) => (
                <div key={node.id} className="relation-card">
                  <img src={node.coverImage?.large} alt={node.title?.romaji} />
                  <div>
                    <p>{relationType}</p>
                    <h3>{node.title?.romaji}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimesInformations;
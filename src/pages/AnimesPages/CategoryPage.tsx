import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchCurrentSeasonAnime,
  fetchAllTimePopular,
  fetchTrendingNow,
  fetchUpcomingAnime,
  fetchTopRatedAnime,
  type Anime,
  type AnimeListResponse
} from '../../components/services/anilistService';
import AnimeGrid from '../../components/ApiComponents/AnimeGrid';
import '../../styles/CategoryPage.css';

const CategoryPage = () => {
  const { categoryType } = useParams<{ categoryType: string }>();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let result: AnimeListResponse;
        switch(categoryType) {
          case 'current-season':
            result = await fetchCurrentSeasonAnime();
            break;
          case 'all-time':
            result = await fetchAllTimePopular();
            break;
          case 'trending':
            result = await fetchTrendingNow();
            break;
          case 'upcoming':
            result = await fetchUpcomingAnime();
            break;
          case 'top-rated':
            result = await fetchTopRatedAnime();
            break;
          default:
            throw new Error('Catégorie invalide');
        }

        setAnimes(result.media);
        setHasMore(result.pageInfo.hasNextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categoryType]);

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      let result: AnimeListResponse;
      
      switch(categoryType) {
        case 'current-season':
          result = await fetchCurrentSeasonAnime({ page: nextPage });
          break;
        case 'all-time':
          result = await fetchAllTimePopular({ page: nextPage });
          break;
        case 'trending':
          result = await fetchTrendingNow({ page: nextPage });
          break;
        case 'upcoming':
          result = await fetchUpcomingAnime({ page: nextPage });
          break;
        case 'top-rated':
          result = await fetchTopRatedAnime({ page: nextPage });
          break;
        default:
          return;
      }

      setAnimes(prev => [...prev, ...result.media]);
      setHasMore(result.pageInfo.hasNextPage);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    switch(categoryType) {
      case 'current-season': return 'Populaires cette saison';
      case 'all-time': return 'Tous les temps populaires';
      case 'trending': return 'Tendances actuelles';
      case 'upcoming': return 'Prochaines sorties';
      case 'top-rated': return 'Top 100 notés';
      default: return 'Catégorie';
    }
  };

  return (
    <div className="category-page">
      <h1>{getCategoryTitle()}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <AnimeGrid animes={animes} loading={loading} />
      
      {hasMore && (
        <button 
          onClick={handleLoadMore}
          disabled={loading}
          className="load-more-button"
        >
          {loading ? 'Chargement...' : 'Afficher plus'}
        </button>
      )}
    </div>
  );
};

export default CategoryPage;
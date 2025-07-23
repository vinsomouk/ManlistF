const ANILIST_API_URL = 'https://graphql.anilist.co';

const WATCHLIST_API_URL = 'http://localhost:8000/api/watchlist'; 

// Définition des types
type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

interface CoverImage {
  large?: string;
  color?: string;
}

export interface Anime {
  id: number;
  title?: AnimeTitle;
  coverImage?: CoverImage;
  averageScore?: number;
  genres?: string[];
  isAdult?: boolean;
  format?: MediaFormat;
  duration?: number; // Changé de string à number
  description?: string;
  episodes?: number;
  status?: string;
  bannerImage?: string | null;
  characters?: any;
  relations?: any;
}

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface FetchOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: 'popular' | 'trending' | 'top_100' | 'upcoming';
  genre?: string[];
  season?: MediaSeason;
  year?: number;
  format?: MediaFormat;
}

export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLANNED';

export const fetchPopularAnime = async (
  options: FetchOptions = {}
): Promise<{ data: Anime[]; pageInfo: PageInfo }> => {
  const { 
    page = 1, 
    perPage = 20, 
    search,
    sort = 'popular',
    genre = [],
    season,
    year,
    format
  } = options;
  
  const getSortVariable = () => {
    switch(sort) {
      case 'trending': return 'TRENDING_DESC';
      case 'top_100': 
        return {
          sort: 'SCORE_DESC',
          forceType: true
        };
      case 'upcoming': return 'POPULARITY_DESC';
      default: return 'POPULARITY_DESC';
    }
  };

  const sortOptions = getSortVariable();
  const sortQuery = typeof sortOptions === 'object' ? sortOptions.sort : sortOptions;

  const query = `
    query (
      $page: Int, 
      $perPage: Int,
      ${search ? '$search: String,' : ''}
      ${genre.length > 0 ? '$genre: [String],' : ''}
      ${season ? '$season: MediaSeason,' : ''}
      ${year ? '$seasonYear: Int,' : ''}
      ${format ? '$format: MediaFormat,' : ''}
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(
          ${sort === 'top_100' ? 'type: ANIME,' : ''}
          sort: ${sortQuery}
          ${search ? 'search: $search' : ''}
          ${genre.length > 0 ? 'genre_in: $genre' : ''}
          ${season ? 'season: $season' : ''}
          ${year ? 'seasonYear: $seasonYear' : ''}
          ${format ? 'format: $format' : ''}
          type: ANIME
          isAdult: false
        ) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            color
          }
          averageScore
          genres
          isAdult
          format
        }
      }
    }
  `;

  const variables = {
    page,
    perPage,
    ...(search && { search }),
    ...(genre.length > 0 && { genre }),
    ...(season && { season }),
    ...(year && { seasonYear: year }),
    ...(format && { format }),
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query.replace(/\s+/g, ' ').trim(),
        variables
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erreur HTTP! Statut: ${response.status}, Body: ${errorBody}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(
        result.errors.map((e: { message: string }) => e.message).join(', ')
      );
    }

    // Filtre supplémentaire pour s'assurer qu'on a bien que des animés
    const mediaData = result.data?.Page?.media || [];
    const filteredData = mediaData.filter((item: Anime) => 
      item.format && ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC'].includes(item.format)
    );

    return {
      data: filteredData,
      pageInfo: result.data?.Page?.pageInfo || {
        total: 0,
        currentPage: page,
        lastPage: 1,
        hasNextPage: false
      }
    };
  } catch (error) {
    console.error('Erreur API AniList:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Une erreur inconnue est survenue');
  }
};

export interface AnimeDetails extends Anime {
  description?: string;
  episodes?: number;
  duration?: number;
  status?: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED';
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  studios?: {
    nodes: {
      name: string;
    }[];
  };
  characters?: {
    nodes: {
      id: number;
      name: {
        full: string;
      };
      image: {
        large: string;
      };
    }[];
  };
  relations?: {
    edges: {
      relationType: string;
      node: Anime;
    }[];
  };
}

export const fetchAnimeDetails = async (id: number): Promise<AnimeDetails> => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          color
        }
        bannerImage
        episodes
        duration
        status
        averageScore
        genres
        isAdult
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        studios {
          nodes {
            name
          }
        }
        characters(sort: ROLE, perPage: 10) {
          nodes {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
              }
              coverImage {
                large
              }
              format
            }
          }
        }
      }
    }
  `;

  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id }
    })
  });

  const result = await response.json();
  return result.data.Media;
};


export interface WatchlistItem {
  animeId: number;
  status: WatchStatus;
  progress: number;
  score?: number;
  notes?: string;
}

const logRequest = (method: string, url: string, data?: any) => {
  console.group('[API] Request');
  console.log('Method:', method);
  console.log('URL:', url);
  if (data) console.log('Payload:', data);
  console.groupEnd();
};

const logResponse = async (response: Response) => {
  const clone = response.clone(); // Clone pour pouvoir lire le corps plusieurs fois
  const status = clone.status;
  let body;
  
  try {
    body = await clone.json();
  } catch {
    body = await clone.text();
  }

  console.group('[API] Response');
  console.log('Status:', status);
  console.log('Body:', body);
  console.log('Headers:', Object.fromEntries(clone.headers.entries()));
  console.groupEnd();

  return response;
};

const handleError = (error: any) => {
  console.error('[API] Error:', error);
  throw error;
};

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  const response = await fetch(`${WATCHLIST_API_URL}`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) throw new Error('Failed to fetch watchlist');
  
  const data = await response.json();
  return data.data || []; // Retourne toujours un tableau
};

export const addToWatchlist = async (item: WatchlistItem): Promise<WatchlistItem> => {
  try {
    const response = await fetch(WATCHLIST_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'ajout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in addToWatchlist:', error);
    throw error;
  }
};

export const updateWatchlistItem = async (animeId: number, updates: Partial<WatchlistItem>): Promise<WatchlistItem> => {
  try {
    const url = `${WATCHLIST_API_URL}/${animeId}`;
    logRequest('PUT', url, updates);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    }).then(logResponse);

    return response.json();
  } catch (error) {
    return handleError(error);
  }
};

export const removeFromWatchlist = async (animeId: number): Promise<void> => {
  try {
    const url = `${WATCHLIST_API_URL}/${animeId}`;
    logRequest('DELETE', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    }).then(logResponse);

    if (!response.ok) {
      throw new Error(`Delete failed with status: ${response.status}`);
    }
  } catch (error) {
    return handleError(error);
  }
};

export type { PageInfo, };
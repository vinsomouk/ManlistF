const ANILIST_API_URL = 'https://graphql.anilist.co';

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

export type { PageInfo };
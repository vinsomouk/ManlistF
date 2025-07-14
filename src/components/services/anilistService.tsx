// src/components/services/anilistService.ts
const ANILIST_API_URL = 'https://graphql.anilist.co';

// Interfaces TypeScript
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
}

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

interface FetchOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * Récupère les animés populaires depuis l'API AniList
 * @param options Options de requête (page, perPage, search)
 * @returns Promise avec les données et les infos de pagination
 */
export const fetchPopularAnime = async (
  options: FetchOptions = {}
): Promise<{ data: Anime[]; pageInfo: PageInfo }> => {
  const { page = 1, perPage = 20, search } = options;
  
  // Requête GraphQL
  const query = `
    query ($page: Int, $perPage: Int${search ? ', $search: String' : ''}) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(
          type: ANIME
          ${search ? 'search: $search' : 'sort: POPULARITY_DESC'}
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
        }
      }
    }
  `;

  const variables = {
    page,
    perPage,
    ...(search && { search })
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

    return {
      data: result.data?.Page?.media || [],
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

// Exportez les types si besoin ailleurs dans l'application
export type { PageInfo, FetchOptions };
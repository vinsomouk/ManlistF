const ANILIST_API_URL = 'https://graphql.anilist.co';

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

export const fetchPopularAnime = async (
  options: FetchOptions = {}
): Promise<{ data: Anime[]; pageInfo: PageInfo }> => {
  const { page = 1, perPage = 20, search } = options;
  
  // Requête GraphQL propre sans caractères problématiques
  const query = search
    ? `query GetPopularAnime($page: Int, $perPage: Int, $search: String) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(
            type: ANIME
            sort: POPULARITY_DESC
            isAdult: false
            search: $search
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
      }`
    : `query GetPopularAnime($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(
            type: ANIME
            sort: POPULARITY_DESC
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
      }`;

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
        query: query.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        variables
      })
    });

    
    console.log('Response:', response); // Log de la réponse
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const result = await response.json();
console.log('Result:', result); // Log du résultat

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error');
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
    console.error('API Error:', error);
    throw error;
  }
};
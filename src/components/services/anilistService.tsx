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
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map((e: {message: string}) => e.message).join(', '));
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
  } catch (e: unknown) { // Meilleure pratique pour TypeScript
    console.error('API Error:', e);
    throw e instanceof Error ? e : new Error('Unknown error occurred');
  }
};
const ANILIST_API_URL = 'https://graphql.anilist.co';
const WATCHLIST_API_URL = `${API_URL}/watchlist`;
  import { API_URL } from '../../../config/api';

type MediaFormat =
  | 'TV'
  | 'TV_SHORT'
  | 'MOVIE'
  | 'SPECIAL'
  | 'OVA'
  | 'ONA'
  | 'MUSIC';

type MediaSeason =
  | 'WINTER'
  | 'SPRING'
  | 'SUMMER'
  | 'FALL';

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
  duration?: number;
  description?: string;
  episodes?: number;
  status?: string;
  bannerImage?: string | null;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface FetchOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sort?:
    | 'popular'
    | 'trending'
    | 'top_100'
    | 'upcoming';
  genre?: string[];
  season?: MediaSeason;
  year?: number;
  format?: MediaFormat;
}

export interface StaffEdge {
  role: string;

  node: {
    id: number;

    name: {
      full: string;
    };

    image: {
      large: string;
    };
  };
}

export interface CharacterEdge {
  role: string;

  node: {
    id: number;

    name: {
      full: string;
    };

    image: {
      large: string;
    };
  };

  voiceActors: Array<{
    id: number;

    name: {
      full: string;
    };

    image: {
      large: string;
    };
  }>;
}

export interface Ranking {
  id: number;
  rank: number;
  type: string;
  context: string;
  year?: number;
}

export type WatchStatus =
  | 'WATCHING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'DROPPED'
  | 'PLANNED';

export interface AnimeDetails extends Anime {
  description?: string;
  episodes?: number;
  duration?: number;

  status?:
    | 'FINISHED'
    | 'RELEASING'
    | 'NOT_YET_RELEASED'
    | 'CANCELLED';

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
    nodes: Array<{
      name: string;
    }>;
  };

  staff?: {
    edges: StaffEdge[];
  };

  characters?: {
    edges: CharacterEdge[];
  };

  rankings?: Ranking[];

  relations?: {
    edges: Array<{
      relationType: string;
      node: Anime;
    }>;
  };
}

export interface WatchlistItem {
  animeId: number;
  status: WatchStatus;
  progress: number;
  score?: number;
  notes?: string;
  animeTitle?: string;
  animeImage?: string;
}

interface ApiError {
  message: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface AniListPageResponse {
  data?: {
    Page?: {
      media?: Anime[];
      pageInfo?: PageInfo;
    };
  };

  errors?: ApiError[];
}

interface AniListDetailsResponse {
  data?: {
    Media?: AnimeDetails;
  };

  errors?: ApiError[];
}

interface WatchlistListResponse {
  data?: WatchlistItem[];
}

interface WatchlistItemResponse {
  item: WatchlistItem;
}

async function parseJson<T>(
  response: Response,
): Promise<T> {
  return response.json() as Promise<T>;
}

const getGraphQlErrorMessage = (
  errors: ApiError[] | undefined,
): string | null => {
  if (!errors?.length) {
    return null;
  }

  return errors
    .map((error) => error.message)
    .join(', ');
};

export const fetchPopularAnime = async (
  options: FetchOptions = {},
): Promise<{
  data: Anime[];
  pageInfo: PageInfo;
}> => {
  const {
    page = 1,
    perPage = 20,
    search,
    sort = 'popular',
    genre = [],
    season,
    year,
    format,
  } = options;

  const getSortVariable = (): string => {
    switch (sort) {
      case 'trending':
        return 'TRENDING_DESC';

      case 'top_100':
        return 'SCORE_DESC';

      case 'upcoming':
        return 'START_DATE';

      case 'popular':
      default:
        return 'POPULARITY_DESC';
    }
  };

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
          sort: ${getSortVariable()}
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
    ...(search ? { search } : {}),
    ...(genre.length > 0 ? { genre } : {}),
    ...(season ? { season } : {}),
    ...(year ? { seasonYear: year } : {}),
    ...(format ? { format } : {}),
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify({
        query: query.replace(/\s+/g, ' ').trim(),
        variables,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Erreur HTTP ! Statut : ${response.status}, contenu : ${errorBody}`,
      );
    }

    const result =
      await parseJson<AniListPageResponse>(response);

    const graphQlError = getGraphQlErrorMessage(
      result.errors,
    );

    if (graphQlError) {
      throw new Error(graphQlError);
    }

    const mediaData = result.data?.Page?.media ?? [];

    const acceptedFormats: MediaFormat[] = [
      'TV',
      'TV_SHORT',
      'MOVIE',
      'SPECIAL',
      'OVA',
      'ONA',
      'MUSIC',
    ];

    const filteredData = mediaData.filter(
      (item) =>
        item.format !== undefined &&
        acceptedFormats.includes(item.format),
    );

    return {
      data: filteredData,

      pageInfo:
        result.data?.Page?.pageInfo ?? {
          total: 0,
          currentPage: page,
          lastPage: 1,
          hasNextPage: false,
        },
    };
  } catch (caughtError) {
    console.error(
      'Erreur API AniList :',
      caughtError,
    );

    throw caughtError instanceof Error
      ? caughtError
      : new Error(
          'Une erreur inconnue est survenue',
        );
  }
};

export const fetchAnimeDetails = async (
  id: number,
): Promise<AnimeDetails> => {
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

        staff(sort: RELEVANCE, perPage: 5) {
          edges {
            role

            node {
              id

              name {
                full
              }

              image {
                large
              }
            }
          }
        }

        characters(perPage: 10, sort: ROLE) {
          edges {
            role

            node {
              id

              name {
                full
              }

              image {
                large
              }
            }

            voiceActors(language: JAPANESE) {
              id

              name {
                full
              }

              image {
                large
              }
            }
          }
        }

        rankings {
          id
          rank
          type
          context
          year
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

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify({
        query,
        variables: {
          id,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Erreur HTTP ! Statut : ${response.status}, contenu : ${errorBody}`,
      );
    }

    const result =
      await parseJson<AniListDetailsResponse>(
        response,
      );

    const graphQlError = getGraphQlErrorMessage(
      result.errors,
    );

    if (graphQlError) {
      throw new Error(graphQlError);
    }

    const media = result.data?.Media;

    if (!media) {
      throw new Error('Anime introuvable');
    }

    return media;
  } catch (caughtError) {
    console.error(
      'Erreur lors du chargement de l’anime :',
      caughtError,
    );

    throw caughtError instanceof Error
      ? caughtError
      : new Error('Erreur inconnue');
  }
};

export const getWatchlist =
  async (): Promise<WatchlistItem[]> => {
    const response = await fetch(WATCHLIST_API_URL, {
      credentials: 'include',

      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Impossible de charger la watchlist : ${errorText}`,
      );
    }

    const data =
      await parseJson<WatchlistListResponse>(
        response,
      );

    return data.data ?? [];
  };

export const addToWatchlist = async (
  item: Omit<
    WatchlistItem,
    'animeTitle' | 'animeImage'
  >,
): Promise<WatchlistItem> => {
  try {
    const response = await fetch(WATCHLIST_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      credentials: 'include',
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData =
        await parseJson<ApiErrorResponse>(
          response,
        ).catch(() => null);

      throw new Error(
        errorData?.error ??
          errorData?.message ??
          "Erreur lors de l'ajout",
      );
    }

    const data =
      await parseJson<WatchlistItemResponse>(
        response,
      );

    return data.item;
  } catch (caughtError) {
    console.error(
      'Erreur dans addToWatchlist :',
      caughtError,
    );

    throw caughtError;
  }
};

export const updateWatchlistItem = async (
  animeId: number,
  updates: Partial<
    Omit<
      WatchlistItem,
      'animeId' | 'animeTitle' | 'animeImage'
    >
  >,
): Promise<WatchlistItem> => {
  try {
    const response = await fetch(
      `${WATCHLIST_API_URL}/${animeId}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        credentials: 'include',
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      const errorData =
        await parseJson<ApiErrorResponse>(
          response,
        ).catch(() => null);

      throw new Error(
        errorData?.error ??
          errorData?.message ??
          'Impossible de modifier la watchlist',
      );
    }

    const data =
      await parseJson<WatchlistItemResponse>(
        response,
      );

    return data.item;
  } catch (caughtError) {
    console.error(
      'Erreur lors de la modification de la watchlist :',
      caughtError,
    );

    throw caughtError;
  }
};

export const removeFromWatchlist = async (
  animeId: number,
): Promise<void> => {
  try {
    const response = await fetch(
      `${WATCHLIST_API_URL}/${animeId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Suppression impossible : ${response.status} - ${errorText}`,
      );
    }
  } catch (caughtError) {
    console.error(
      'Erreur lors de la suppression de la watchlist :',
      caughtError,
    );

    throw caughtError;
  }
};
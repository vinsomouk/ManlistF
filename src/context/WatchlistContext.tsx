import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  getWatchlist,
  addToWatchlist as apiAddToWatchlist,
  updateWatchlistItem as apiUpdateWatchlistItem,
  removeFromWatchlist as apiRemoveFromWatchlist,
  type WatchlistItem,
} from '../components/services/anilistService';

import { useAuth } from '../hooks/useAuth';

type EditableWatchlistFields = Omit<
  WatchlistItem,
  'animeId' | 'animeTitle' | 'animeImage'
>;

type NewWatchlistItem = Omit<
  WatchlistItem,
  'animeTitle' | 'animeImage'
>;

type WatchlistContextType = {
  watchlist: WatchlistItem[];
  loading: boolean;
  error: string | null;
  addToWatchlist: (
    item: NewWatchlistItem,
  ) => Promise<WatchlistItem>;
  removeFromWatchlist: (
    animeId: number,
  ) => Promise<void>;
  updateWatchlistItem: (
    animeId: number,
    updates: Partial<EditableWatchlistFields>,
  ) => Promise<void>;
  fetchWatchlist: () => Promise<void>;
};

const WatchlistContext = createContext<
  WatchlistContextType | undefined
>(undefined);

export const WatchlistProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();

  const [watchlist, setWatchlist] = useState<
    WatchlistItem[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getWatchlist();

      setWatchlist(data);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Erreur inconnue',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAddToWatchlist = async (
    item: NewWatchlistItem,
  ): Promise<WatchlistItem> => {
    if (!user) {
      throw new Error('Non connecté');
    }

    try {
      setLoading(true);

      const newItem = await apiAddToWatchlist(item);

      setWatchlist((previousWatchlist) => [
        ...previousWatchlist,
        newItem,
      ]);

      return newItem;
    } catch (caughtError) {
      const addError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Erreur inconnue');

      if (addError.message.includes('409')) {
        throw new Error(
          'Cet anime est déjà dans votre watchlist',
        );
      }

      throw addError;
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (
    animeId: number,
  ): Promise<void> => {
    try {
      setLoading(true);

      await apiRemoveFromWatchlist(animeId);

      setWatchlist((previousWatchlist) =>
        previousWatchlist.filter(
          (item) => item.animeId !== animeId,
        ),
      );
    } catch (caughtError) {
      const removeError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Erreur inconnue');

      setError(
        `Erreur suppression: ${removeError.message}`,
      );

      throw removeError;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (
    animeId: number,
    updates: Partial<EditableWatchlistFields>,
  ): Promise<void> => {
    try {
      setLoading(true);

      const updatedItem =
        await apiUpdateWatchlistItem(
          animeId,
          updates,
        );

      setWatchlist((previousWatchlist) =>
        previousWatchlist.map((item) =>
          item.animeId === animeId
            ? { ...item, ...updatedItem }
            : item,
        ),
      );
    } catch (caughtError) {
      const updateError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Erreur inconnue');

      setError(
        `Erreur mise à jour: ${updateError.message}`,
      );

      throw updateError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        error,
        addToWatchlist: handleAddToWatchlist,
        removeFromWatchlist:
          handleRemoveFromWatchlist,
        updateWatchlistItem: handleUpdateItem,
        fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWatchlist =
  (): WatchlistContextType => {
    const context = useContext(WatchlistContext);

    if (!context) {
      throw new Error(
        'useWatchlist must be used within a WatchlistProvider',
      );
    }

    return context;
  };
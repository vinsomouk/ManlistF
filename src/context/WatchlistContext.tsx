import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { 
  getWatchlist, 
  addToWatchlist as apiAddToWatchlist, 
  updateWatchlistItem as apiUpdateWatchlistItem, 
  removeFromWatchlist as apiRemoveFromWatchlist,
  type WatchlistItem,
  type WatchStatus
} from '../components/services/anilistService';
import { useAuth } from '../hooks/useAuth';

type WatchlistContextType = {
  watchlist: WatchlistItem[];
  loading: boolean;
  error: string | null;
  addToWatchlist: (item: Omit<WatchlistItem, 'animeTitle' | 'animeImage'>) => Promise<WatchlistItem>;
  removeFromWatchlist: (animeId: number) => Promise<void>;
  updateWatchlistItem: (animeId: number, updates: Partial<Omit<WatchlistItem, 'animeId' | 'animeTitle' | 'animeImage'>>) => Promise<void>;
  fetchWatchlist: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const fetchWatchlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getWatchlist();
      setWatchlist(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (item: Omit<WatchlistItem, 'animeTitle' | 'animeImage'>) => {
    if (!user) throw new Error('Non connecté');
    
    try {
      setLoading(true);
      const newItem = await apiAddToWatchlist(item);
      setWatchlist(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('409')) {
        throw new Error('Cet anime est déjà dans votre watchlist');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (animeId: number) => {
    try {
      setLoading(true);
      await apiRemoveFromWatchlist(animeId);
      setWatchlist(prev => prev.filter(item => item.animeId !== animeId));
    } catch (err) {
      const error = err as Error;
      setError(`Erreur suppression: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (
    animeId: number, 
    updates: Partial<Omit<WatchlistItem, 'animeId' | 'animeTitle' | 'animeImage'>>
  ) => {
    try {
      setLoading(true);
      const updatedItem = await apiUpdateWatchlistItem(animeId, updates);
      setWatchlist(prev => prev.map(item => 
        item.animeId === animeId ? { ...item, ...updatedItem } : item
      ));
    } catch (err) {
      const error = err as Error;
      setError(`Erreur mise à jour: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      fetchWatchlist();
    }
  }, [user]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loading,
      error,
      addToWatchlist: handleAddToWatchlist,
      removeFromWatchlist: handleRemoveFromWatchlist,
      updateWatchlistItem: handleUpdateItem,
      fetchWatchlist
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
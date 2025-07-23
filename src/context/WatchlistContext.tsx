import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist } from '../components/services/anilistService';
import { useAuth } from '../hooks/useAuth';
import type { WatchlistItem, WatchStatus } from '../components/services/anilistService';

type WatchlistContextType = {
  watchlist: WatchlistItem[];
  loading: boolean;
  error: string | null;
  addToWatchlist: (animeId: number) => Promise<void>;
  removeFromWatchlist: (animeId: number) => Promise<void>;
  updateWatchlistStatus: (animeId: number, status: WatchStatus) => Promise<void>;
  updateWatchlistProgress: (animeId: number, progress: number) => Promise<void>;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (animeId: number) => {
    if (!user) throw new Error('Non connecté');
    
    try {
      const newItem = await addToWatchlist({
        animeId,
        status: 'PLANNED',
        progress: 0
      });
      setWatchlist(prev => [...prev, newItem]);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('409')) {
        throw new Error('Cet anime est déjà dans votre watchlist');
      }
      throw error;
    }
  };

  const handleRemoveFromWatchlist = async (animeId: number) => {
    try {
      await removeFromWatchlist(animeId);
      setWatchlist(prev => prev.filter(item => item.animeId !== animeId));
    } catch (err) {
      const error = err as Error;
      throw error;
    }
  };

  const handleUpdateStatus = async (animeId: number, status: WatchStatus) => {
    try {
      const updatedItem = await updateWatchlistItem(animeId, { status });
      setWatchlist(prev => prev.map(item => 
        item.animeId === animeId ? updatedItem : item
      ));
    } catch (err) {
      const error = err as Error;
      throw error;
    }
  };

  const handleUpdateProgress = async (animeId: number, progress: number) => {
    try {
      const updatedItem = await updateWatchlistItem(animeId, { progress });
      setWatchlist(prev => prev.map(item => 
        item.animeId === animeId ? updatedItem : item
      ));
    } catch (err) {
      const error = err as Error;
      throw error;
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
      updateWatchlistStatus: handleUpdateStatus,
      updateWatchlistProgress: handleUpdateProgress,
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
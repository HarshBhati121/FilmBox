import { useState, useEffect, useCallback } from 'react';
import { watchlistApi } from '../api/client';
import toast from 'react-hot-toast';

export function useWatchlist(user) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch watchlist on mount if there's a user logged in
  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const data = await watchlistApi.get();
        if (isMounted) setWatchlist(data);
      } catch (error) {
        console.error('Failed to fetch watchlist:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchWatchlist();

    return () => { isMounted = false; };
  }, [user]);

  const addMovie = useCallback(async (movieId, status = 'watchlist') => {
    if (!user) return toast.error('Please login first');
    
    // Optimistic update
    const newItem = { movieId, status };
    setWatchlist(prev => [...prev, newItem]);
    
    try {
      await watchlistApi.add(movieId, status);
      toast.success(status === 'watched' ? 'Marked as watched' : 'Added to watchlist');
    } catch (err) {
      toast.error(err.message);
      // Revert optimistic update
      setWatchlist(prev => prev.filter(item => item.movieId !== movieId));
    }
  }, [user]);

  const removeMovie = useCallback(async (movieId) => {
    if (!user) return;
    
    // Optimistic update
    const prevWatchlist = [...watchlist];
    setWatchlist(prev => prev.filter(item => item.movieId !== movieId));
    
    try {
      await watchlistApi.remove(movieId);
      toast.success('Removed from list');
    } catch (err) {
      toast.error(err.message);
      setWatchlist(prevWatchlist);
    }
  }, [user, watchlist]);

  const toggleStatus = useCallback(async (movieId) => {
    if (!user) return;

    // Optimistic update
    const prevWatchlist = [...watchlist];
    setWatchlist(prev => prev.map(item => {
      if (item.movieId === movieId) {
        return { ...item, status: item.status === 'watchlist' ? 'watched' : 'watchlist' };
      }
      return item;
    }));

    try {
      await watchlistApi.updateStatus(movieId);
    } catch (err) {
      toast.error(err.message);
      setWatchlist(prevWatchlist);
    }
  }, [user, watchlist]);

  const getMovieStatus = useCallback((movieId) => {
    const item = watchlist.find(item => Number(item.movieId) === Number(movieId));
    return item ? item.status : null;
  }, [watchlist]);

  return {
    watchlist,
    loading,
    addMovie,
    removeMovie,
    toggleStatus,
    getMovieStatus
  };
}

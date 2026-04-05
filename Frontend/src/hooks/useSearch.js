import { useState, useEffect } from 'react';
import { movieApi, userApi } from '../api/client';

export function useSearch(query, type = 'movie', delay = 300) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (type === 'movie') {
          data = await movieApi.search(query);
          // TMDB returns results in data.results
          setResults(data.results || []);
        } else if (type === 'user') {
          data = await userApi.search(query);
          setResults(data || []);
        }
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [query, type, delay]);

  return { results, loading, error };
}

import { useState, useEffect } from 'react';
import { movieApi } from '../api/client';

export function useMovie(id) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await movieApi.getMovie(id);
        if (isMounted) setMovie(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMovie();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { movie, loading, error };
}

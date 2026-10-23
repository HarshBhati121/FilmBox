import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { activityApi, movieApi, tvApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w200';

function ResultRow({ item, href }) {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  return (
    <Link to={href} className="content-row">
      {item.poster_path ? (
        <img src={`${IMAGE_BASE}${item.poster_path}`} alt="" />
      ) : (
        <div className="search-result-poster search-result-poster--empty" />
      )}
      <div>
        <strong>{title}</strong>
        {year && <span className="content-row-meta"> ({year})</span>}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const query = params.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setShows([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      movieApi.search(query),
      tvApi.search(query).catch(() => ({ results: [] })),
    ])
      .then(([movieData, tvData]) => {
        if (!mounted) return;
        setMovies(movieData.results || []);
        setShows(tvData.results || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [query]);

  useEffect(() => {
    if (!user || query.trim().length < 2) return;
    activityApi.recordSearch(query).catch((recordError) => {
      toast.error(`Could not save this search to your history: ${recordError.message}`);
    });
  }, [query, user]);

  return (
    <div className="container page-wrapper">
      <h1 className="section-title">
        {query ? `Search results for "${query}"` : 'Search FilmBox'}
      </h1>
      <p>Books, comics, games, music, and sports will appear here as providers are added. Movies and TV use TMDB.</p>

      {loading && <p className="page-loading">Searching...</p>}
      {error && (
        <div className="glass-panel lists-empty">
          <p>{error}</p>
        </div>
      )}

      {!loading && query && (
        <>
          <section className="search-group">
            <h2>Movies</h2>
            {movies.length > 0 ? (
              movies.slice(0, 20).map((movie) => (
                <ResultRow key={movie.id} item={movie} href={`/movies/${movie.id}`} />
              ))
            ) : (
              <p>No movies found.</p>
            )}
          </section>

          <section className="search-group">
            <h2>TV</h2>
            {shows.length > 0 ? (
              shows.slice(0, 20).map((show) => (
                <ResultRow key={show.id} item={show} href={`/tv/${show.id}`} />
              ))
            ) : (
              <p>No TV shows found.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

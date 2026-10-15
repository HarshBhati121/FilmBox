import { useState, useEffect } from 'react';
import { tvApi } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function TvBrowse() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    tvApi.trending()
      .then((data) => setShows(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page-wrapper">
      <h1 className="section-title">TV</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="poster-grid">
        {shows.map((show) => (
          <MovieCard key={show.id} movie={{ ...show, title: show.name }} to={`/tv/${show.id}`} />
        ))}
      </div>
    </div>
  );
}

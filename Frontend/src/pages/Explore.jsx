import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieApi, tvApi } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function Explore() {
  const [tab, setTab] = useState('movies');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const request = tab === 'tv' ? tvApi.trending() : movieApi.trending();
    request
      .then((data) => {
        if (mounted) setItems(data.results || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [tab]);

  return (
    <div className="container page-wrapper">
      <h1 className="section-title">Explore</h1>
      <p>
        Browse Movies and TV now. Books, comics, games, anime, music, and sports will use the same page once providers are connected.
      </p>
      <p style={{ margin: '12px 0' }}>
        <button type="button" className="btn" onClick={() => setTab('movies')}>Movies</button>{' '}
        <button type="button" className="btn" onClick={() => setTab('tv')}>TV</button>
      </p>
      {loading && <p>Loading...</p>}
      {error && <p>{error} <button type="button" className="btn" onClick={() => setTab(tab)}>Retry</button></p>}
      {!loading && (
        <div className="poster-grid">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              movie={{ ...item, title: item.title || item.name }}
              to={tab === 'tv' ? `/tv/${item.id}` : `/movies/${item.id}`}
            />
          ))}
        </div>
      )}
      <p style={{ marginTop: '16px' }}><Link to="/search">Go to search</Link></p>
    </div>
  );
}

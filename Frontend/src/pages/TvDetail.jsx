import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tvApi } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function TvDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [error, setError] = useState(null);
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    tvApi.get(id).then(setShow).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container page-wrapper"><p>{error}</p></div>;
  if (!show) return <div className="page-loading">Loading show...</div>;

  const year = (show.first_air_date || '').split('-')[0];
  const genres = (show.genres || []).map((g) => g.name).join(' · ');

  return (
    <div className="container page-wrapper">
      <div className="film-detail-layout">
        <div className="film-poster-sidebar">
          <img
            src={show.poster_path ? `${IMAGE_BASE}${show.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
            alt={show.name}
            className="film-main-poster"
          />
        </div>
        <div className="film-info-main">
          <h1 className="film-title">{show.name} <span style={{ fontWeight: 'normal', color: '#555' }}>{year}</span></h1>
          <p>{genres}</p>
          <div className="film-overview"><p>{show.overview}</p></div>
          {show.created_by?.length > 0 && (
            <p>Created by {show.created_by.map((c) => c.name).join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

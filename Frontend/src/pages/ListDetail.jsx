import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listApi, movieApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import MovieCard from '../components/MovieCard';
import FilmSearchPicker from '../components/FilmSearchPicker';
import toast from 'react-hot-toast';

export default function ListDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const avatarUrl = useAvatarUrl(list?.userId);

  const isOwner = user && list?.userId && String(user._id) === String(list.userId._id || list.userId);

  const loadMovies = async (ids = []) => {
    if (!ids.length) {
      setMovies([]);
      return;
    }
    const results = await Promise.all(
      ids.map((movieId) => movieApi.getMovie(movieId).catch(() => ({
        id: movieId,
        title: `Film #${movieId}`,
        poster_path: null,
      })))
    );
    setMovies(results.filter(Boolean));
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await listApi.get(id);
        setList(data);
        await loadMovies(data.movies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  const handleRemoveFilm = async (movie) => {
    try {
      const updated = await listApi.removeMovie(id, movie.id);
      setList(updated);
      await loadMovies(updated.movies || []);
      toast.success(`Removed ${movie.title}`);
    } catch (err) {
      toast.error(err.message || 'Could not remove film');
    }
  };

  const handleAddFilm = async (movie) => {
    try {
      const updated = await listApi.addMovie(id, movie.id);
      setList(updated);
      await loadMovies(updated.movies || []);
      setShowPicker(false);
      toast.success(`Added ${movie.title}`);
    } catch (err) {
      toast.error(err.message || 'Could not add film');
    }
  };

  if (loading) return <div className="page-loading">Loading list...</div>;
  if (error || !list) return <div className="page-loading" style={{ color: 'var(--red)' }}>{error || 'List not found'}</div>;

  return (
    <div className="container page-wrapper">
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{list.name}</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{list.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          <Link to={`/profile/${list.userId?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <img
              src={avatarUrl}
              alt={list.userId?.username}
              style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
            />
            {list.userId?.username}
          </Link>
          <span>•</span>
          <span>{movies.length} films</span>
        </div>
        {isOwner && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            onClick={() => setShowPicker(true)}
          >
            Add film
          </button>
        )}
      </div>

      {movies.length > 0 ? (
        <div className="poster-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="list-poster-wrap">
              <MovieCard movie={movie} />
              {isOwner && (
                <button
                  type="button"
                  className="list-remove-btn"
                  onClick={() => handleRemoveFilm(movie)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel lists-empty">
          <p>This list is empty.{isOwner ? ' Add a film to get started.' : ''}</p>
        </div>
      )}

      {showPicker && (
        <div className="film-picker-modal-backdrop" onClick={() => setShowPicker(false)}>
          <div className="film-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="film-picker-modal-header">
              <h3>Add a film to {list.name}</h3>
              <button type="button" className="film-picker-modal-close" onClick={() => setShowPicker(false)}>
                ✕
              </button>
            </div>
            <FilmSearchPicker onSelect={handleAddFilm} />
          </div>
        </div>
      )}
    </div>
  );
}

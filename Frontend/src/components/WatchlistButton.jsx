import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import toast from 'react-hot-toast';

export default function WatchlistButton({ movieId, className = '' }) {
  const { user } = useAuth();
  const { getMovieStatus, addMovie, removeMovie, toggleStatus, loading } = useWatchlist(user);

  const status = getMovieStatus(movieId);

  const requireLogin = () => {
    toast.error('Please sign in to manage your watchlist');
  };

  const handleWatchlist = async () => {
    if (!user) return requireLogin();
    if (status === 'watchlist') {
      await removeMovie(movieId);
    } else if (status === 'watched') {
      await toggleStatus(movieId);
    } else {
      await addMovie(movieId, 'watchlist');
    }
  };

  const handleWatched = async () => {
    if (!user) return requireLogin();
    if (status === 'watched') {
      await removeMovie(movieId);
    } else if (status === 'watchlist') {
      await toggleStatus(movieId);
    } else {
      await addMovie(movieId, 'watched');
    }
  };

  return (
    <div className={`film-action-stack ${className}`}>
      <button
        type="button"
        onClick={handleWatchlist}
        disabled={loading}
        className={`btn ${status === 'watchlist' ? 'btn-secondary' : 'btn-primary'}`}
        style={{ width: '100%' }}
      >
        {loading ? '...' : status === 'watchlist' ? '✓ On Watchlist' : '+ Add to Watchlist'}
      </button>
      <button
        type="button"
        onClick={handleWatched}
        disabled={loading}
        className={`btn ${status === 'watched' ? 'btn-secondary' : 'btn-secondary'}`}
        style={{ width: '100%' }}
      >
        {status === 'watched' ? '✓ Watched' : 'Mark as watched'}
      </button>
    </div>
  );
}

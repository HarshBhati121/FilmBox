import { useWatchlist } from '../hooks/useWatchlist';
import toast from 'react-hot-toast';

export default function WatchlistButton({ movieId, className = '' }) {
  const { isInWatchlist, toggleWatchlist, loading } = useWatchlist(movieId);

  const handleClick = async () => {
    try {
      await toggleWatchlist();
    } catch (err) {
      toast.error('Must be logged in to manage watchlist');
    }
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={loading}
      className={`btn ${isInWatchlist ? 'btn-secondary' : 'btn-primary'} ${className}`}
      style={{width:'100%'}}
    >
      {loading ? '...' : isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
    </button>
  );
}

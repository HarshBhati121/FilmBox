import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listApi, watchlistApi, movieApi } from '../api/client';
import FavoriteFilms from '../components/FavoriteFilms';
import MovieCard from '../components/MovieCard';
import ListCard from '../components/ListCard';
import toast from 'react-hot-toast';

async function loadWatchlistMovies(watchlistItems) {
  const results = await Promise.all(
    watchlistItems.map(async (item) => {
      try {
        return await movieApi.getMovie(item.movieId);
      } catch {
        return {
          id: item.movieId,
          title: `Film #${item.movieId}`,
          poster_path: null,
        };
      }
    })
  );
  return results;
}

export default function Lists() {
  const { user } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [customLists, setCustomLists] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [watchlistError, setWatchlistError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user?._id) return;

    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const watchlistRes = await watchlistApi.get();
        const watchlistItems = (watchlistRes || []).filter((item) => item.status === 'watchlist');
        const watchedItems = (watchlistRes || []).filter((item) => item.status === 'watched');
        setWatchlistCount(watchlistItems.length);

        const [toWatch, watched] = await Promise.all([
          watchlistItems.length ? loadWatchlistMovies(watchlistItems) : Promise.resolve([]),
          watchedItems.length ? loadWatchlistMovies(watchedItems) : Promise.resolve([]),
        ]);
        setWatchlistMovies(toWatch);
        setWatchedMovies(watched);
    } catch (err) {
      console.error(err);
      setWatchlistError('Could not load watchlist. Try refreshing the page.');
          setWatchlistMovies([]);
          setWatchedMovies([]);
          setWatchlistCount(0);
    } finally {
      setWatchlistLoading(false);
    }
  }, [user?._id]);

  const fetchCustomLists = useCallback(async () => {
    if (!user?._id) return;

    setListsLoading(true);
    try {
      const listsRes = await listApi.getMyLists();
      setCustomLists(listsRes || []);
    } catch (err) {
      console.error(err);
      setCustomLists([]);
    } finally {
      setListsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      setWatchlistLoading(false);
      setListsLoading(false);
      return;
    }

    fetchWatchlist();
    fetchCustomLists();
  }, [user?._id, fetchWatchlist, fetchCustomLists]);

  useEffect(() => {
    const handleFocus = () => {
      if (user?._id) fetchWatchlist();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?._id, fetchWatchlist]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return toast.error('Give your list a name');

    setCreating(true);
    try {
      const created = await listApi.create(name, newDescription.trim(), true);
      setCustomLists((prev) => [{ ...created, userId: user }, ...prev]);
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
      toast.success('List created');
    } catch (err) {
      toast.error(err.message || 'Could not create list');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="container page-wrapper lists-page">
        <div className="glass-panel page-empty">
          <p>Sign in to manage your favorites, watchlist, and lists.</p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper lists-page">
      <h1 className="section-title">Your Lists</h1>

      <FavoriteFilms />

      <section className="lists-section">
        <div className="lists-section-header">
          <div>
            <h2 className="lists-section-title">Watchlist</h2>
            <p className="lists-section-subtitle">
              Films you want to watch{watchlistCount > 0 ? ` · ${watchlistCount} films` : ''}.
            </p>
          </div>
          <button type="button" className="btn btn-secondary lists-refresh-btn" onClick={fetchWatchlist}>
            Refresh
          </button>
        </div>

        {watchlistLoading ? (
          <div className="page-loading">Loading watchlist...</div>
        ) : watchlistError ? (
          <div className="glass-panel lists-empty">
            <p>{watchlistError}</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '12px' }} onClick={fetchWatchlist}>
              Retry
            </button>
          </div>
        ) : watchlistCount > 0 ? (
          <div className="poster-grid">
            {watchlistMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="glass-panel lists-empty">
            <p>Your watchlist is empty. Add films from any film page using &quot;+ Add to Watchlist&quot;.</p>
            <Link to="/films" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Browse Films
            </Link>
          </div>
        )}
      </section>

      <section className="lists-section">
        <h2 className="lists-section-title">Watched</h2>
        <p className="lists-section-subtitle">Films you've marked as watched.</p>
        {watchlistLoading ? (
          <div className="page-loading">Loading watched films...</div>
        ) : watchedMovies.length > 0 ? (
          <div className="poster-grid">
            {watchedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="glass-panel lists-empty">
            <p>No watched films yet. Open a film and tap “Mark as watched”.</p>
          </div>
        )}
      </section>

      <section className="lists-section">
        <div className="lists-section-header">
          <div>
            <h2 className="lists-section-title">Custom Lists</h2>
            <p className="lists-section-subtitle">Group films around a theme, ranking, or mood.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary lists-refresh-btn"
            onClick={() => setShowCreate((open) => !open)}
          >
            {showCreate ? 'Cancel' : 'New List'}
          </button>
        </div>

        {showCreate && (
          <form className="glass-panel create-list-form" onSubmit={handleCreateList}>
            <div className="form-group">
              <label htmlFor="list-name">List name</label>
              <input
                id="list-name"
                className="form-control"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Comfort films"
              />
            </div>
            <div className="form-group">
              <label htmlFor="list-desc">Description (optional)</label>
              <textarea
                id="list-desc"
                className="form-control"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What belongs on this list?"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create list'}
            </button>
          </form>
        )}

        {listsLoading ? (
          <div className="page-loading">Loading lists...</div>
        ) : customLists.length > 0 ? (
          <div className="lists-custom-grid">
            {customLists.map((list) => (
              <ListCard key={list._id} list={list} />
            ))}
          </div>
        ) : (
          <div className="glass-panel lists-empty">
            <p>No custom lists yet. Create one to start grouping films.</p>
          </div>
        )}
      </section>
    </div>
  );
}

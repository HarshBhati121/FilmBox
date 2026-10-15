import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieApi, userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FilmSearchPicker from './FilmSearchPicker';
import toast from 'react-hot-toast';

const SLOT_LABELS = ['#1', '#2', '#3', '#4'];
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

function toSlots(favoriteFilms = []) {
  const slots = [0, 0, 0, 0];
  favoriteFilms.slice(0, 4).forEach((id, index) => {
    if (id) slots[index] = id;
  });
  return slots;
}

export default function FavoriteFilms() {
  const { user, refreshUser } = useAuth();
  const [movies, setMovies] = useState([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  const slots = toSlots(user?.favoriteFilms);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      const loaded = [null, null, null, null];
      await Promise.all(
        slots.map(async (id, index) => {
          if (!id) return;
          try {
            const movie = await movieApi.getMovie(id);
            if (isMounted) loaded[index] = movie;
          } catch {
            if (isMounted) loaded[index] = { id, title: 'Unknown film', poster_path: null };
          }
        })
      );
      if (isMounted) setMovies(loaded);
    };

    loadMovies();
    return () => { isMounted = false; };
  }, [slots.join(',')]);

  const saveSlots = async (nextSlots) => {
    setSaving(true);
    try {
      await userApi.updateMe({ favoriteFilms: nextSlots });
      await refreshUser();
      toast.success('Saved automatically');
    } catch (err) {
      toast.error(err.message || 'Could not save favorites');
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = async (movie) => {
    if (activeSlot === null) return;
    const nextSlots = [...slots];
    nextSlots[activeSlot] = movie.id;
    await saveSlots(nextSlots);
    setActiveSlot(null);
  };

  const handleRemove = async (slotIndex) => {
    const nextSlots = [...slots];
    nextSlots[slotIndex] = 0;
    await saveSlots(nextSlots);
  };

  return (
    <>
      <section className="favorites-hero glass-panel">
        <div className="favorites-hero-header">
          <div>
            <h2>Top 4 Favorites</h2>
            <p>Pick up to 4 films — saves automatically when you choose one.</p>
          </div>
          {saving && <span className="favorites-saving">Saving...</span>}
        </div>

        <div className="favorites-grid">
          {SLOT_LABELS.map((label, index) => {
            const movie = movies[index];

            return (
              <div key={label} className="favorite-slot">
                <span className="favorite-slot-label">{label}</span>
                {movie ? (
                  <div className="favorite-slot-filled">
                    <Link to={`/movies/${movie.id}`} className="favorite-slot-poster">
                      <img
                        src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.title}
                      />
                      <div className="favorite-slot-overlay">
                        <span>{movie.title}</span>
                      </div>
                    </Link>
                    <div className="favorite-slot-actions">
                      <button type="button" className="btn btn-secondary favorite-slot-btn" onClick={() => setActiveSlot(index)}>
                        Change
                      </button>
                      <button type="button" className="btn btn-secondary favorite-slot-btn" onClick={() => handleRemove(index)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="favorite-slot-empty"
                    onClick={() => setActiveSlot(index)}
                  >
                    <span className="favorite-slot-plus">+</span>
                    <span>Add film</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {activeSlot !== null && (
        <div className="film-picker-modal-backdrop" onClick={() => setActiveSlot(null)}>
          <div className="film-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="film-picker-modal-header">
              <h3>Choose favorite {SLOT_LABELS[activeSlot]}</h3>
              <button type="button" className="film-picker-modal-close" onClick={() => setActiveSlot(null)}>
                ✕
              </button>
            </div>
            <FilmSearchPicker onSelect={handleSelect} onClose={() => setActiveSlot(null)} />
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';

export default function FilmSearchPicker({ onSelect }) {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query, 'movie', 300);
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w200';

  return (
    <div className="film-search-picker film-search-picker--modal">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a film..."
        className="form-control"
        autoFocus
      />
      <div className="film-search-picker-results">
        {loading ? (
          <div className="film-search-picker-empty">Searching...</div>
        ) : query && results.length > 0 ? (
          results.slice(0, 8).map((movie) => (
            <button
              key={movie.id}
              type="button"
              className="film-search-picker-item"
              onClick={() => onSelect(movie)}
            >
              {movie.poster_path ? (
                <img src={`${IMAGE_BASE}${movie.poster_path}`} alt={movie.title} />
              ) : (
                <div className="film-search-picker-placeholder" />
              )}
              <span>{movie.title}</span>
            </button>
          ))
        ) : query ? (
          <div className="film-search-picker-empty">No films found</div>
        ) : (
          <div className="film-search-picker-empty">Type to search films</div>
        )}
      </div>
    </div>
  );
}

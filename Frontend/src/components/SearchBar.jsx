import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, loading } = useSearch(query, 'movie', 400);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w200';

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearch = () => {
    if (!query.trim()) return;
    setShowResults(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      ref={wrapperRef}
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        goToSearch();
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Search FilmBox"
        className="form-control search-input"
        aria-label="Search FilmBox"
      />

      {showResults && query.length > 0 && (
        <div className="search-results">
          {loading ? (
            <div className="search-result-empty">Searching...</div>
          ) : results.length > 0 ? (
            <>
              <ul className="search-result-list">
                {results.slice(0, 5).map((movie) => (
                  <li key={movie.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResults(false);
                        setQuery('');
                        navigate(`/movies/${movie.id}`);
                      }}
                      className="search-result-item"
                    >
                      {movie.poster_path ? (
                        <img src={`${IMAGE_BASE}${movie.poster_path}`} alt="" className="search-result-poster" />
                      ) : (
                        <div className="search-result-poster search-result-poster--empty" />
                      )}
                      <div className="search-result-info">
                        <h4>{movie.title}</h4>
                        <p>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={goToSearch} className="search-view-all">
                All results for "{query}"
              </button>
            </>
          ) : (
            <div className="search-result-empty">No results found</div>
          )}
        </div>
      )}
    </form>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, loading } = useSearch(query, 'movie', 400);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (movieId) => {
    setShowResults(false);
    setQuery('');
    navigate(`/movies/${movieId}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search films..."
          className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-full focus:ring-green-500 focus:border-green-500 block pl-10 p-2 transition-all placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
      </div>

      {showResults && (query.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {results.slice(0, 5).map(movie => (
                <li key={movie.id}>
                  <button
                    onClick={() => handleSelect(movie.id)}
                    className="w-full text-left p-3 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    {movie.poster_path ? (
                      <img 
                        src={`${import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w200'}${movie.poster_path}`} 
                        alt={movie.title} 
                        className="w-8 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-gray-600 rounded"></div>
                    )}
                    <div>
                      <h4 className="font-medium text-white text-sm truncate max-w-[200px]">{movie.title}</h4>
                      <p className="text-xs text-gray-400">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { movieApi } from '../api/client';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

export default function Films() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let data;
        if (query) {
          data = await movieApi.search(query);
        } else {
          data = await movieApi.trending();
        }
        setMovies(data.results || []);
      } catch (err) {
        console.error('Failed to fetch movies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [query]);

  return (
    <div className="container page-wrapper">
      <div className="header-container">
        <h1 className="section-title">
          {query ? `Search Results for "${query}"` : 'Popular Films'}
        </h1>
        <div className="search-wrapper">
          <SearchBar />
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding:'80px', color:'var(--text-secondary)'}}>Loading films...</div>
      ) : (
        <>
          {movies.length > 0 ? (
            <div className="poster-grid">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
             <div className="glass-panel" style={{textAlign:'center', padding:'80px', color:'var(--text-secondary)'}}>
               <p>No films found. Try a different search.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}

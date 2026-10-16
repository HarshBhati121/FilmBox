import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { movieApi } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function Person() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPerson = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await movieApi.getPerson(id);
        if (isMounted) setPerson(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (id) fetchPerson();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <div className="text-center p-20 text-gray-400">Loading details...</div>;
  if (error || !person) return <div className="text-center p-20 text-red-500">{error || 'Person not found'}</div>;

  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';
  
  // Sort movies by popularity or release date
  const castMovies = person.movie_credits?.cast?.sort((a, b) => b.popularity - a.popularity).slice(0, 24) || [];
  const dirMovies = person.movie_credits?.crew?.filter(c => c.job === 'Director').sort((a, b) => b.popularity - a.popularity).slice(0, 24) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-shrink-0">
          <img 
            src={person.profile_path ? `${IMAGE_BASE}${person.profile_path}` : 'https://via.placeholder.com/300x450?text=No+Image'} 
            alt={person.name}
            className="w-48 md:w-64 rounded-xl border border-gray-700 shadow-2xl"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{person.name}</h1>
          <div className="text-gray-400 mb-6 flex gap-4 text-sm uppercase tracking-wider">
             {person.known_for_department && <span>{person.known_for_department}</span>}
             {person.birthday && <span>Born: {person.birthday}</span>}
          </div>
          
          <div className="text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm md:text-base">
            {person.biography ? person.biography : "No biography available."}
          </div>
        </div>
      </div>

      {dirMovies.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Directed</h2>
          <div className="poster-grid">
            {dirMovies.map((movie, idx) => (
              <div key={`${movie.id}-${idx}`}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      {castMovies.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Known For (Cast)</h2>
          <div className="poster-grid">
            {castMovies.map((movie, idx) => (
              <div key={`${movie.id}-${idx}`}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

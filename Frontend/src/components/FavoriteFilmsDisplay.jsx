import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../api/client';
import MovieCard from './MovieCard';

export default function FavoriteFilmsDisplay({ favoriteFilms = [] }) {
  const [movies, setMovies] = useState([]);
  const ids = (favoriteFilms || []).filter(Boolean).slice(0, 4);

  useEffect(() => {
    let active = true;
    if (!ids.length) {
      setMovies([]);
      return undefined;
    }

    Promise.all(
      ids.map((id) => movieApi.getMovie(id).catch(() => ({ id, title: 'Unknown film', poster_path: null })))
    ).then((results) => {
      if (active) setMovies(results.filter(Boolean));
    });

    return () => { active = false; };
  }, [ids.join(',')]);

  if (!ids.length) return null;

  return (
    <section className="profile-favorites">
      <h2 className="section-title">Favorite Films</h2>
      <div className="poster-grid profile-favorites-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <p className="profile-favorites-hint">
        <Link to="/lists">Edit on Lists</Link>
      </p>
    </section>
  );
}

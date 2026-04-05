import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';
  const posterUrl = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <img
        src={posterUrl}
        alt={movie.title || movie.name}
        loading="lazy"
      />
      <div className="overlay">
        <h4>{movie.title || movie.name}</h4>
      </div>
    </Link>
  );
}

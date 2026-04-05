import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Your posters in public/posters/ (renamed to poster-1.jpg … poster-10.jpg)
const POSTER_COUNT = 10;
const posterSrc = (i) => `/posters/poster-${(i % POSTER_COUNT) + 1}.jpg`;

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">Your life in film</h1>
        <p className="hero-subtitle">
          Track films you've watched, build lists, and share your taste.
        </p>
        {!user && (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Create an account</Link>
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
          </div>
        )}
      </section>
      <section className="section">
        <h2 className="section-title">Popular this week</h2>
        <div className="poster-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="poster-card">
              <img src={posterSrc(i)} alt="" className="poster-img" />
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">From your watchlist</h2>
        <div className="poster-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="poster-card">
              <img src={posterSrc(12 + i)} alt="" className="poster-img" />
            </div>
          ))}
        </div>
        <p className="text-muted">Add films to your watchlist to see them here.</p>
      </section>
    </div>
  );
}

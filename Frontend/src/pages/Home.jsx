import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieApi, tvApi, reviewApi, activityApi } from '../api/client';
import MovieCard from '../components/MovieCard';
import FriendActivityItem from '../components/FriendActivityItem';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [trendingMovies, trendingTv, recentReviews, recentActivity] = await Promise.all([
          movieApi.trending(),
          tvApi.trending().catch(() => ({ results: [] })),
          reviewApi.getRecent().catch(() => []),
          activityApi.getRecent().catch(() => []),
        ]);
        if (!mounted) return;
        setMovies(trendingMovies.results?.slice(0, 10) || []);
        setShows(trendingTv.results?.slice(0, 10) || []);
        setReviews(Array.isArray(recentReviews) ? recentReviews : []);
        setActivity(Array.isArray(recentActivity) ? recentActivity : []);
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load homepage');
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container page-wrapper">
      <section className="hero">
        <h1>FILMBOX</h1>
        <p>Everything you love about pop culture — movies, TV, and soon books, comics, games, and more.</p>
      </section>

      {error && (
        <div className="glass-panel lists-empty">
          <p>{error}</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="home-columns">
        <div>
          <section>
            <h2 className="section-title">Trending Movies</h2>
            {movies.length > 0 ? (
              <div className="poster-grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <p className="page-empty">Loading movies...</p>
            )}
          </section>

          <section style={{ marginTop: '28px' }}>
            <h2 className="section-title">Trending TV</h2>
            {shows.length > 0 ? (
              <div className="poster-grid">
                {shows.map((show) => (
                  <MovieCard key={show.id} movie={{ ...show, title: show.name }} to={`/tv/${show.id}`} />
                ))}
              </div>
            ) : (
              <p className="page-empty">No TV results yet.</p>
            )}
          </section>
        </div>

        <aside>
          <section>
            <h2 className="section-title">Popular Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="content-row" style={{ display: 'block' }}>
                  <Link to={`/profile/${review.userId?.username}`}>{review.userId?.username}</Link>
                  {' '}★ {review.rating}/5
                  {review.movieId && (
                    <>
                      {' · '}
                      <Link to={`/movies/${review.movieId}`}>film</Link>
                    </>
                  )}
                  {review.reviewText && <p style={{ margin: '4px 0 0' }}>{review.reviewText.slice(0, 140)}</p>}
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </section>

          <section style={{ marginTop: '28px' }}>
            <h2 className="section-title">Community Activity</h2>
            {activity.length > 0 ? (
              activity.slice(0, 8).map((item) => (
                <FriendActivityItem key={item._id} activity={item} />
              ))
            ) : (
              <p>No recent activity.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

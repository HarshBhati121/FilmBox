import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieApi, tvApi, reviewApi, activityApi } from '../api/client';
import MovieCard from '../components/MovieCard';
import FriendActivityItem from '../components/FriendActivityItem';

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(4); // Wait for trending, topRated, popular, feed

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [trendingData, topRatedData, popularData] = await Promise.all([
          movieApi.trending(),
          movieApi.topRated(),
          movieApi.popular()
        ]);
        if (isMounted) {
          setTrending(trendingData.results?.slice(0, 12) || []);
          setTopRated(topRatedData.results?.slice(0, 12) || []);
          setPopular(popularData.results?.slice(0, 10) || []);
        }
      } catch (err) {
        console.error('Failed to fetch movies', err);
      } finally {
        if (isMounted) setLoadingTasks(prev => prev - 3);
      }

      if (user) {
        try {
          const feedData = await activityApi.getFeed(1);
          if (isMounted) setFeed(feedData.activity || []);
        } catch (err) {
          console.error('Failed to fetch feed', err);
        } finally {
          if (isMounted) setLoadingTasks(prev => prev - 1);
        }
      } else {
        if (isMounted) setLoadingTasks(prev => prev - 1);
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
              ))}
            </div>
          </div>
        ) : (
          <div style={{padding:'40px', textAlign:'center', color:'var(--text-secondary)'}}>
             <span>Loading trending films...</span>
          </div>
        )}
      </section>

      <section style={{ overflow: 'hidden', marginTop: '40px' }}>
        <h2 className="section-title">Movies to watch at least once</h2>
        {topRated.length > 0 ? (
          <div className="marquee-container" style={{ animationDirection: 'reverse' }}>
            <div className="marquee-content" style={{ animationDirection: 'reverse' }}>
              {topRated.map((movie) => (
                <div key={movie.id} className="carousel-item" style={{ minWidth: '150px' }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            <div className="marquee-content" aria-hidden="true" style={{ animationDirection: 'reverse' }}>
              {topRated.map((movie) => (
                <div key={`${movie.id}-dup`} className="carousel-item" style={{ minWidth: '150px' }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{padding:'40px', textAlign:'center', color:'var(--text-secondary)'}}>
             <span>Loading...</span>
          </div>
        )}
      </section>

      <section style={{ overflow: 'hidden', marginTop: '40px' }}>
        <h2 className="section-title">FilmBox's Top 10 Films</h2>
        {popular.length > 0 ? (
          <div className="marquee-container">
            <div className="marquee-content">
              {popular.map((movie) => (
                <div key={movie.id} className="carousel-item" style={{ minWidth: '150px' }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            <div className="marquee-content" aria-hidden="true">
              {popular.map((movie) => (
                <div key={`${movie.id}-dup`} className="carousel-item" style={{ minWidth: '150px' }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{padding:'40px', textAlign:'center', color:'var(--text-secondary)'}}>
             <span>Loading...</span>
          </div>
        )}
      </section>
    </div>
  );
}

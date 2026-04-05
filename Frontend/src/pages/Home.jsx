import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { movieApi, activityApi } from '../api/client';
import MovieCard from '../components/MovieCard';
import ActivityItem from '../components/ActivityItem';

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(2); // Wait for trending and feed

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const trendingData = await movieApi.trending();
        if (isMounted) setTrending(trendingData.results?.slice(0, 12) || []);
      } catch (err) {
        console.error('Failed to fetch trending', err);
      } finally {
        if (isMounted) setLoadingTasks(prev => prev - 1);
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
    
    fetchHomeData();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <div className="container page-wrapper">
      {!user && (
        <section className="hero glass-panel">
          <h1>Your life in film</h1>
          <p>Track films you've watched, save those you want to see, and discover what your friends are watching.</p>
          <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </section>
      )}

      {user && (
        <section style={{marginBottom: '40px'}}>
          <h2 className="section-title">Activity from friends</h2>
          {feed.length > 0 ? (
            <div style={{display:'flex', flexDirection:'column'}}>
              {feed.map((activity, idx) => (
                <ActivityItem key={activity._id || idx} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{padding:'40px', textAlign:'center'}}>
               <p style={{color:'var(--text-secondary)'}}>No recent activity. Try finding some users to follow!</p>
               <Link to="/members" style={{marginTop:'12px', display:'inline-block'}}>Browse Members</Link>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="section-title">Trending this week</h2>
        {trending.length > 0 ? (
          <div className="poster-grid">
            {trending.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div style={{padding:'40px', textAlign:'center', color:'var(--text-secondary)'}}>
             <span>Loading trending films...</span>
          </div>
        )}
      </section>
    </div>
  );
}

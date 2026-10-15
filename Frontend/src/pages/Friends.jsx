import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityApi } from '../api/client';
import FriendActivityItem from '../components/FriendActivityItem';

export default function Friends() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = async () => {
      setLoading(true);
      try {
        const data = await activityApi.getFeed(1);
        if (isMounted) {
          setFeed(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch friends activity', err);
        if (isMounted) setFeed([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeed();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="container page-wrapper friends-page">
      <h1 className="section-title">Friends Activity</h1>
      <p className="friends-page-subtitle">
        Films your friends have watched or reviewed.
      </p>

      {loading ? (
        <div className="page-loading">Loading activity...</div>
      ) : feed.length > 0 ? (
        <div className="friends-activity-list">
          {feed.map((activity) => (
            <FriendActivityItem key={activity._id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="glass-panel page-empty">
          <p>No friend activity yet. Follow members to see what they watch and review.</p>
          <Link to="/members" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Find Members
          </Link>
        </div>
      )}
    </div>
  );
}

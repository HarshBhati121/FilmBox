import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { activityApi, userApi, listApi } from '../api/client';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import FollowButton from '../components/FollowButton';
import FriendActivityItem from '../components/FriendActivityItem';
import FavoriteFilmsDisplay from '../components/FavoriteFilmsDisplay';
import ListCard from '../components/ListCard';

export default function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarUrl = useAvatarUrl(user);

  const isOwnProfile = authUser && user && String(authUser._id) === String(user._id);

  const refreshProfile = async () => {
    if (!username) return;
    try {
      const updated = await userApi.getProfile(username);
      setUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let targetUser = null;
        if (username) {
          targetUser = await userApi.getProfile(username);
        } else if (authUser) {
          targetUser = authUser;
        }

        if (targetUser && isMounted) {
          setUser(targetUser);
          const [acts, userLists] = await Promise.all([
            activityApi.getUserActivity(targetUser._id),
            listApi.getUserLists(targetUser._id).catch(() => []),
          ]);
          setActivities(Array.isArray(acts) ? acts : []);
          setLists(Array.isArray(userLists) ? userLists : []);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [username, authUser]);

  if (loading) return <div className="page-loading">Loading profile...</div>;
  if (!user) return <div className="page-loading">User not found</div>;

  return (
    <div className="container page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="profile-header glass-panel">
        <div className="profile-bg" />
        <img src={avatarUrl} alt={user.username} className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name-row">
            <h1>{user.username}</h1>
            {!isOwnProfile && (
              <FollowButton userId={user._id} username={user.username} onChange={refreshProfile} />
            )}
          </div>
          {user.bio && (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
              "{user.bio}"
            </p>
          )}
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-num">{user.followers?.length || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{user.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      <FavoriteFilmsDisplay favoriteFilms={user.favoriteFilms} />

      {lists.length > 0 && (
        <section className="profile-lists">
          <h2 className="section-title">Lists</h2>
          <div className="lists-custom-grid">
            {lists.map((list) => (
              <ListCard key={list._id} list={{ ...list, userId: list.userId || user }} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Recent Activity</h2>
        {activities.length > 0 ? (
          <div>
            {activities.map((activity) => (
              <FriendActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="glass-panel page-empty" style={{ padding: '40px' }}>
            <p>Films, lists, and activity will appear here once you start using Filmbox.</p>
          </div>
        )}
      </section>
    </div>
  );
}

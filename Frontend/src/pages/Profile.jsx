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
  const { user: authUser, setUser: setAuthUser } = useAuth();
  
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
  }, [username, authUser?.username]);

  const isFollowing = authUser?.following?.includes(user?._id);

  const toggleFollow = async () => {
    if (!authUser) return;
    try {
      if (isFollowing) {
        const updatedAuthUser = await userApi.unfollow(user._id);
        setAuthUser(updatedAuthUser);
        setUser(prev => ({ ...prev, followers: prev.followers.filter(id => id !== authUser._id) }));
      } else {
        const updatedAuthUser = await userApi.follow(user._id);
        setAuthUser(updatedAuthUser);
        setUser(prev => ({ ...prev, followers: [...(prev.followers || []), authUser._id] }));
      }
    } catch (err) {
      console.error('Follow toggle failed', err);
    }
  };

  if (loading) return <div className="text-center p-20 text-gray-400">Loading profile...</div>;
  if (!user) return <div className="text-center p-20 text-gray-400">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-50 pointer-events-none" />
        
        <img 
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
          alt={user.username}
          className="w-32 h-32 rounded-full border-4 border-gray-700 relative z-10 bg-gray-900"
        />
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
            
            {authUser && authUser._id !== user._id && (
              <button 
                onClick={toggleFollow}
                className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-bold transition-all ${isFollowing ? 'bg-gray-700 text-white hover:bg-red-500 hover:text-white border border-gray-600' : 'bg-green-500 text-black hover:bg-green-400'}`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          {user.bio && <p className="text-gray-300 italic mb-4">"{user.bio}"</p>}
          
          <div className="flex gap-6 justify-center md:justify-start">
            <div className="text-center">
              <span className="block font-bold text-white text-xl">{user.followers?.length || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Followers</span>
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

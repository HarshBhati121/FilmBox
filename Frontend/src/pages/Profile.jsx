import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { activityApi, userApi } from '../api/client';
import ActivityItem from '../components/ActivityItem';

export default function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
          const acts = await activityApi.getUserActivity(targetUser._id);
          setActivities(acts || []);
        } else {
           if (isMounted) setUser(null);
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

  if (loading) return <div className="text-center p-20 text-gray-400">Loading profile...</div>;
  if (!user) return <div className="text-center p-20 text-gray-400">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-50 pointer-events-none" />
        
        <img 
          src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
          alt={user.username}
          className="w-32 h-32 rounded-full border-4 border-gray-700 relative z-10 bg-gray-900"
        />
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
          <p className="text-gray-400 mb-4">{user.email}</p>
          {user.bio && <p className="text-gray-300 italic mb-4">"{user.bio}"</p>}
          
          <div className="flex gap-6 justify-center md:justify-start">
            <div className="text-center">
              <span className="block font-bold text-white text-xl">{user.followers?.length || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-white text-xl">{user.following?.length || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Following</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Recent Activity</h2>
        {activities.length > 0 ? (
          <div className="space-y-4">
             {activities.map(activity => (
               <ActivityItem key={activity._id} activity={activity} />
             ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-10 text-center border border-gray-800">
             <p className="text-gray-400">Films, lists, and activity will appear here once you start using Filmbox.</p>
          </div>
        )}
      </section>
    </div>
  );
}

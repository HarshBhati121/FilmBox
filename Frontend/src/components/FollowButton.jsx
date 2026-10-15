import { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function isFollowingUser(authUser, targetUserId) {
  if (!authUser?.following || !targetUserId) return false;
  return authUser.following.some((id) => String(id) === String(targetUserId));
}

export default function FollowButton({ userId, username, compact = false, onChange }) {
  const { user, refreshUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(isFollowingUser(user, userId));
  }, [user, userId]);

  if (!user || String(user._id) === String(userId)) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (isFollowing) {
        await userApi.unfollow(userId);
        toast.success(`Unfollowed ${username}`);
        setIsFollowing(false);
        onChange?.(false);
      } else {
        await userApi.follow(userId);
        toast.success(`Now following ${username}`);
        setIsFollowing(true);
        onChange?.(true);
      }
      await refreshUser();
    } catch (err) {
      toast.error(err.message || 'Could not update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`btn follow-btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} ${compact ? 'follow-btn--compact' : ''}`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

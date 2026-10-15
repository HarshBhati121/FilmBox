import { Link } from 'react-router-dom';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import FollowButton from './FollowButton';

export default function UserCard({ user }) {
  const avatarUrl = useAvatarUrl(user);

  return (
    <div className="user-card glass-panel">
      <Link to={`/profile/${user.username}`} className="user-card-link">
        <img src={avatarUrl} alt={user.username} className="user-avatar" />
        <div className="user-card-info">
          <h3>{user.username}</h3>
          {user.bio && <p className="user-card-bio">{user.bio}</p>}
        </div>
      </Link>
      <FollowButton userId={user._id} username={user.username} compact />
    </div>
  );
}

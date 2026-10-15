import { Link } from 'react-router-dom';
import { useAvatarUrl } from '../hooks/useAvatarUrl';

const ACTION_LABELS = {
  watched: 'watched',
  reviewed: 'reviewed',
  rated: 'rated',
};

export default function FriendActivityItem({ activity }) {
  const avatarUrl = useAvatarUrl(activity.userId);
  const action = ACTION_LABELS[activity.type] || activity.type;

  return (
    <Link to={`/movies/${activity.movieId}`} className="friend-activity-item glass-panel">
      <img
        src={avatarUrl}
        alt={activity.userId?.username}
        className="friend-activity-avatar"
      />
      <div className="friend-activity-text">
        <span className="friend-activity-user">{activity.userId?.username}</span>
        <span className="friend-activity-action">{action}</span>
        <span className="friend-activity-film">{activity.movieTitle || 'Unknown film'}</span>
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { useAvatarUrl } from '../hooks/useAvatarUrl';

const ACTIVITY_LABELS = {
  reviewed: 'reviewed',
  rated: 'rated',
  watchlisted: 'added to watchlist',
  watched: 'watched',
  followed: 'followed',
  listed: 'created a list',
};

export default function ActivityItem({ activity }) {
  const avatarUrl = useAvatarUrl(activity.userId);
  const label = ACTIVITY_LABELS[activity.type] || activity.type;

  return (
    <div className="glass-panel activity-card">
      <Link to={`/profile/${activity.userId?.username}`} className="activity-avatar-link">
        <img
          src={avatarUrl}
          alt={activity.userId?.username}
          className="activity-avatar"
        />
      </Link>

      <div className="activity-body">
        <div className="activity-summary">
          <Link to={`/profile/${activity.userId?.username}`} className="activity-username">
            {activity.userId?.username}
          </Link>
          <span className="activity-action">{label}</span>

          {activity.type === 'followed' && activity.targetUserId && (
            <Link to={`/profile/${activity.targetUserId.username}`} className="activity-target">
              {activity.targetUserId.username}
            </Link>
          )}

          {activity.movieId && (
            <Link to={`/movies/${activity.movieId}`} className="activity-target">
              a film
            </Link>
          )}

          {activity.listId && (
            <Link to={`/lists/${activity.listId._id || activity.listId}`} className="activity-target">
              {activity.listId.name || 'a list'}
            </Link>
          )}

          <span className="activity-date">
            {new Date(activity.createdAt).toLocaleDateString()}
          </span>
        </div>

        {activity.meta && (
          <div className="activity-meta">
            <p>{activity.type === 'rated' ? `★ ${activity.meta}/5` : activity.meta}</p>
          </div>
        )}
      </div>
    </div>
  );
}

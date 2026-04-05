import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container">
      <h1 className="page-title">Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p className="text-muted">{user.email}</p>
          {user.createdAt && (
            <p className="profile-meta">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <section className="section">
        <h2 className="section-title">Your activity</h2>
        <p className="text-muted">
          Films, lists, and diary entries will appear here once you start logging.
        </p>
      </section>
    </div>
  );
}

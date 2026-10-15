import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="nav-links">
        <Link to="/" className="logo">FILMBOX</Link>
        <Link to="/films">Movies</Link>
        <Link to="/tv">TV</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/lists">Lists</Link>
        <Link to="/members">Members</Link>
        {user && <Link to="/friends">Friends</Link>}
      </nav>

      <div style={{ flex: 1, maxWidth: '280px' }}>
        <SearchBar />
      </div>

      <nav className="nav-links">
        {user ? (
          <>
            <Link to={`/profile/${user.username}`}>{user.username}</Link>
            <button type="button" onClick={handleLogout} className="btn btn-secondary">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

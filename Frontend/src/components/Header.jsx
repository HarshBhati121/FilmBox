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
      <Link to="/" className="logo">
        Film<span className="logo-accent">box</span>
      </Link>
      
      <div style={{flex: 1, maxWidth: '400px', display: 'flex', justifyContent: 'center'}}>
        <SearchBar />
      </div>

      <nav className="nav-links">
        <Link to="/films">Films</Link>
        <Link to="/lists">Lists</Link>
        <Link to="/members">Members</Link>
        
        {user ? (
          <div style={{display:'flex', alignItems:'center', gap:'16px', marginLeft:'12px', paddingLeft:'16px', borderLeft:'1px solid var(--glass-border)'}}>
            <Link to={`/profile/${user.username}`} style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-primary)'}}>
              <img 
                src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
                alt={user.username} 
              />
              <span>{user.username}</span>
            </Link>
            <button type="button" onClick={handleLogout} style={{background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer'}}>
              Sign out
            </button>
          </div>
        ) : (
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginLeft:'12px', paddingLeft:'16px', borderLeft:'1px solid var(--glass-border)'}}>
            <Link to="/login" style={{color:'var(--text-secondary)'}}>Sign in</Link>
            <Link to="/register" className="btn btn-primary" style={{padding:'8px 16px', fontSize:'13px'}}>
              Create Account
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

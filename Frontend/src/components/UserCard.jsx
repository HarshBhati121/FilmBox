import { Link } from 'react-router-dom';

export default function UserCard({ user }) {
  return (
    <Link to={`/profile/${user.username}`} className="user-card glass-panel" style={{display:'flex', alignItems:'center', gap:'16px', padding:'20px', textDecoration:'none', transition:'transform 0.2s'}}>
      <img 
        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
        alt={user.username} 
        style={{width:'64px', height:'64px', borderRadius:'50%', border:'2px solid var(--glass-border)'}}
      />
      <div>
        <h3 style={{fontSize:'18px', fontWeight:'bold', color:'var(--text-primary)', margin:0, marginBottom:'4px'}}>{user.username}</h3>
        <div style={{display:'flex', gap:'12px', fontSize:'13px', color:'var(--text-secondary)'}}>
          <span>{user.followers?.length || 0} Followers</span>
          <span>{user.following?.length || 0} Following</span>
        </div>
      </div>
    </Link>
  );
}

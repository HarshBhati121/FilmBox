import { Link } from 'react-router-dom';

export default function ActivityItem({ activity }) {
  return (
    <div className="glass-panel" style={{padding:'20px', marginBottom:'12px', display:'flex', gap:'16px', alignItems:'flex-start'}}>
      <Link to={`/profile/${activity.userId?.username}`} style={{flexShrink:0}}>
        <img 
          src={activity.userId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
          alt={activity.userId?.username}
          style={{width:'48px', height:'48px', borderRadius:'50%', border:'2px solid var(--glass-border)'}}
        />
      </Link>
      
      <div style={{flex:1}}>
        <div style={{marginBottom:'8px'}}>
          <Link to={`/profile/${activity.userId?.username}`} style={{fontWeight:'bold', color:'var(--text-primary)'}}>
            {activity.userId?.username}
          </Link>
          <span style={{color:'var(--text-secondary)', margin:'0 6px'}}>{activity.type === 'review' ? 'reviewed' : 'watched'}</span>
          <strong style={{color:'var(--text-primary)'}}>{activity.targetTitle || 'a film'}</strong>
          <span style={{color:'var(--text-secondary)', fontSize:'12px', marginLeft:'12px'}}>
            {new Date(activity.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {activity.meta && (
          <div style={{background:'var(--bg-tertiary)', padding:'12px 16px', borderRadius:'8px', borderLeft:'3px solid var(--accent-color)', marginTop:'8px'}}>
            <p style={{color:'var(--text-secondary)', fontSize:'14px', margin:0}}>{activity.meta}</p>
          </div>
        )}
      </div>
    </div>
  );
}

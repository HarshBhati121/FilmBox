import { Link } from 'react-router-dom';

export default function ListCard({ list }) {
  return (
    <Link to={`/lists/${list._id}`} className="glass-panel" style={{display:'block', padding:'24px', transition:'transform 0.2s', textDecoration:'none'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px'}}>
        <h3 style={{fontSize:'20px', fontWeight:'bold', color:'var(--text-primary)', margin:0}}>{list.name}</h3>
        <span style={{background:'var(--accent-color)', color:'#000', padding:'4px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold'}}>
          {list.movies?.length || 0} films
        </span>
      </div>
      
      <p style={{color:'var(--text-secondary)', fontSize:'14px', marginBottom:'16px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
        {list.description || 'No description provided.'}
      </p>
      
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'auto', paddingTop:'16px', borderTop:'1px solid var(--glass-border)'}}>
        <img 
          src={list.userId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
          alt={list.userId?.username}
          style={{width:'24px', height:'24px', borderRadius:'50%'}}
        />
        <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>By {list.userId?.username}</span>
      </div>
    </Link>
  );
}

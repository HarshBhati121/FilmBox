import { Link } from 'react-router-dom';

export default function ReviewCard({ review }) {
  return (
    <div className="glass-panel" style={{padding:'24px', marginBottom:'16px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
        <Link to={`/profile/${review.userId?.username}`} style={{display:'flex', alignItems:'center', gap:'12px', color:'var(--text-primary)'}}>
          <img 
            src={review.userId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
            alt={review.userId?.username}
            style={{width:'40px', height:'40px', borderRadius:'50%'}}
          />
          <div>
            <span style={{display:'block', fontWeight:'bold', fontSize:'15px'}}>{review.userId?.username}</span>
            <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </Link>
        {review.rating && (
          <div style={{color:'var(--accent-color)', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px', background:'rgba(0, 229, 112, 0.1)', padding:'4px 8px', borderRadius:'12px'}}>
            ★ {review.rating}/5
          </div>
        )}
      </div>
      <p style={{color:'var(--text-primary)', lineHeight:'1.6'}}>{review.reviewText}</p>
    </div>
  );
}

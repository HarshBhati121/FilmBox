import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewApi } from '../api/client';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import toast from 'react-hot-toast';

export default function ReviewCard({ review, onChange, movieId }) {
  const { user } = useAuth();
  const avatarUrl = useAvatarUrl(review.userId);
  const [comment, setComment] = useState('');
  const likes = review.likes?.length || 0;

  const refresh = async () => {
    if (!onChange || !movieId) return;
    const data = await reviewApi.getForMovie(movieId);
    onChange(data.reviews || []);
  };

  const handleLike = async () => {
    if (!user) return toast.error('Sign in to like reviews');
    try {
      await reviewApi.like(review._id);
      await refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Sign in to comment');
    if (!comment.trim()) return;
    try {
      await reviewApi.addComment(review._id, comment.trim());
      setComment('');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '12px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <Link to={`/profile/${review.userId?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src={avatarUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid #ccc' }} />
          <div>
            <span style={{ display: 'block', fontWeight: 'bold' }}>{review.userId?.username}</span>
            <span style={{ fontSize: '12px', color: '#555' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </Link>
        {review.rating && <div>★ {review.rating}/5</div>}
      </div>
      <p style={{ lineHeight: 1.5 }}>{review.reviewText}</p>
      <p style={{ fontSize: '12px', marginTop: '8px' }}>
        <button type="button" className="btn" onClick={handleLike}>{likes} likes</button>
        {' · '}{review.comments?.length || 0} comments
      </p>
      {review.comments?.length > 0 && (
        <div style={{ marginTop: '8px', paddingLeft: '8px', borderLeft: '2px solid #ddd' }}>
          {review.comments.map((c) => (
            <p key={c._id} style={{ fontSize: '13px', marginBottom: '4px' }}>{c.text}</p>
          ))}
        </div>
      )}
      {user && onChange && (
        <form onSubmit={handleComment} style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
          <input className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" />
          <button type="submit" className="btn">Post</button>
        </form>
      )}
    </div>
  );
}

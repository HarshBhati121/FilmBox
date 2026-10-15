import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMovie } from '../hooks/useMovie';
import { movieApi, reviewApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import WatchlistButton from '../components/WatchlistButton';
import AddToListButton from '../components/AddToListButton';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import MovieCard from '../components/MovieCard';
import toast from 'react-hot-toast';

export default function FilmDetail() {
  const { id } = useParams();
  const { movie, loading, error } = useMovie(id);
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const data = await reviewApi.getForMovie(id);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      }
    };
    fetchReviews();
    movieApi.similar(id).then((data) => setSimilar((data.results || []).slice(0, 8))).catch(() => {});
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'80px', color:'var(--text-secondary)'}}>Loading film details...</div>;
  if (error || !movie) return <div style={{textAlign:'center', padding:'80px', color:'var(--red)'}}>{error || 'Film not found'}</div>;

  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in to review');
    if (myRating === 0) return toast.error('Please provide a rating');

    setIsSubmitting(true);
    try {
      await reviewApi.create(id, myRating, myReview);
      toast.success('Review published!');
      const data = await reviewApi.getForMovie(id);
      setReviews(data.reviews || []);
      setMyReview('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="film-detail-layout">
          {/* Poster & Actions */}
          <div className="film-poster-sidebar">
            <img 
              src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
              alt={movie.title} 
              className="film-main-poster"
            />
            
            <div className="glass-panel" style={{marginTop:'24px', padding:'20px'}}>
              <WatchlistButton movieId={movie.id} />
              <div style={{marginTop:'12px'}}>
                <AddToListButton movieId={movie.id} />
              </div>
              
              <div style={{marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--glass-border)'}}>
                <p style={{fontSize:'14px', color:'var(--text-secondary)', marginBottom:'8px'}}>Rate this film</p>
                <StarRating rating={myRating} setRating={setMyRating} />
              </div>
            </div>
          </div>

          {/* Details & Reviews */}
          <div className="film-info-main">
            <h1 className="film-title">
              {movie.title} <span style={{color:'var(--text-secondary)', fontWeight:'normal'}}>{(movie.release_date || '').split('-')[0]}</span>
            </h1>
            
            <p style={{color:'var(--text-secondary)', marginBottom:'24px', fontSize:'15px'}}>
              Directed by <span style={{color:'var(--text-primary)'}}>{
                movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown'
              }</span>
            </p>

            <div className="film-overview">
              <p>{movie.overview}</p>
            </div>

            {/* Quick Stats */}
            <div className="film-stats glass-panel">
              {movie.vote_average && (
                <div className="stat-item">
                  <span className="stat-label">TMDB Rating</span>
                  <span className="stat-value">{movie.vote_average.toFixed(1)}<span className="stat-sub">/10</span></span>
                </div>
              )}
              {movie.runtime && (
                <div className="stat-item">
                  <span className="stat-label">Runtime</span>
                  <span className="stat-value">{movie.runtime} <span className="stat-sub">mins</span></span>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div style={{marginTop:'48px', paddingTop:'32px', borderTop:'1px solid var(--glass-border)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'24px'}}>
                <h2 style={{fontSize:'24px', fontWeight:'bold'}}>Reviews</h2>
                <span style={{color:'var(--text-secondary)'}}>{reviews.length} reviews</span>
              </div>

              {/* Add Review Form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="glass-panel" style={{marginBottom:'32px', padding:'24px'}}>
                  <h3 style={{fontWeight:'bold', marginBottom:'12px'}}>Add your review</h3>
                  {myRating === 0 && <p style={{color:'var(--red)', fontSize:'14px', marginBottom:'12px'}}>Please rate the film on the left before reviewing.</p>}
                  <textarea 
                    value={myReview}
                    onChange={(e) => setMyReview(e.target.value)}
                    placeholder="What did you think of the film?"
                    className="form-control"
                    style={{height:'100px', marginBottom:'16px', resize:'vertical'}}
                  />
                  <button type="submit" disabled={isSubmitting || myRating === 0} className="btn btn-primary" style={{width:'100%'}}>
                    {isSubmitting ? 'Publishing...' : 'Publish Review'}
                  </button>
                </form>
              )}

              {/* Review List */}
              <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                {reviews.map(review => (
                  <ReviewCard key={review._id} review={review} onChange={setReviews} movieId={id} />
                ))}
                {reviews.length === 0 && (
                  <p>No reviews yet. Be the first to share your thoughts.</p>
                )}
              </div>
            </div>

            {similar.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h2 className="section-title">Similar Movies</h2>
                <div className="poster-grid">
                  {similar.map((item) => (
                    <MovieCard key={item.id} movie={item} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
    </div>
  );
}

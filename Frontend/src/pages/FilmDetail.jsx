import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovie } from '../hooks/useMovie';
import { reviewApi, userApi } from '../api/client';
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
  const { user, setUser } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const trailer = movie?.videos?.results?.find(v => v.type === 'Trailer') || movie?.videos?.results?.[0];
  const isFavorite = user?.favoriteFilms?.includes(Number(id));
  const watchProviders = movie?.['watch/providers']?.results?.US?.flatrate || [];

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

  const toggleFavorite = async () => {
    if (!user) return toast.error('You must be logged in to set favorite films');

    let newFavorites = [...(user.favoriteFilms || [])];
    const numId = Number(id);

    if (isFavorite) {
      newFavorites = newFavorites.filter(fid => fid !== numId);
    } else {
      if (newFavorites.length >= 4) {
        return toast.error('You can only have up to 4 favorite films. Please remove one first.');
      }
      newFavorites.push(numId);
    }

    try {
      const updatedUser = await userApi.updateMe({ favoriteFilms: newFavorites });
      setUser(updatedUser);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to Top 4 favorites!');
    } catch (err) {
      toast.error('Failed to update favorites: ' + err.message);
    }
  };

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

  const director = movie.credits?.crew?.find(c => c.job === 'Director');

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
              
              <button 
                onClick={toggleFavorite}
                className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'}`} 
                style={{width: '100%', marginTop: '12px'}}
              >
                {isFavorite ? '★ In Top 4 Favorites' : '☆ Add to Top 4'}
              </button>

              {trailer && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="btn btn-secondary" 
                  style={{width: '100%', marginTop: '12px'}}
                >
                  ▶ Play Trailer
                </button>
              )}
            </div>
          </div>

          {/* Details & Reviews */}
          <div className="film-info-main">
            <h1 className="film-title">
              {movie.title} <span style={{color:'var(--text-secondary)', fontWeight:'normal'}}>{(movie.release_date || '').split('-')[0]}</span>
            </h1>
            
            <p style={{color:'var(--text-secondary)', marginBottom:'24px', fontSize:'15px'}}>
              Directed by {director ? (
                <Link to={`/person/${director.id}`} style={{color:'var(--text-primary)', fontWeight: 'bold'}}>
                  {director.name}
                </Link>
              ) : <span style={{color:'var(--text-primary)'}}>Unknown</span>}
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

            {/* Watch Providers Section */}
            {watchProviders.length > 0 && (
              <div style={{marginBottom:'32px'}} className="glass-panel">
                <div style={{padding:'20px', borderBottom:'1px solid var(--glass-border)'}}>
                  <h3 style={{margin:0, fontSize:'16px', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px'}}>Where to Watch</h3>
                </div>
                <div style={{padding:'20px', display:'flex', gap:'16px', overflowX:'auto'}} className="hide-scrollbar">
                  {watchProviders.map(provider => (
                    <div key={provider.provider_id} style={{textAlign:'center', minWidth:'60px'}}>
                      <img 
                        src={`${IMAGE_BASE}${provider.logo_path}`} 
                        alt={provider.provider_name}
                        style={{width:'60px', height:'60px', borderRadius:'12px', marginBottom:'8px'}}
                      />
                      <div style={{fontSize:'12px', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'80px'}}>
                        {provider.provider_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast Section */}
            {movie.credits?.cast?.length > 0 && (
              <div style={{marginTop:'48px'}}>
                <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'16px', color:'var(--text-primary)'}}>Cast</h2>
                <div style={{display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'16px'}} className="hide-scrollbar">
                  {movie.credits.cast.slice(0, 10).map(actor => (
                    <Link key={actor.id} to={`/person/${actor.id}`} style={{minWidth:'120px', textAlign:'center', display:'block'}}>
                      <img 
                        src={actor.profile_path ? `${IMAGE_BASE}${actor.profile_path}` : 'https://via.placeholder.com/150x225?text=No+Image'} 
                        alt={actor.name}
                        style={{width:'120px', height:'180px', objectFit:'cover', borderRadius:'8px', marginBottom:'8px'}}
                      />
                      <div style={{fontSize:'14px', fontWeight:'600', color:'var(--text-primary)'}}>{actor.name}</div>
                      <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{actor.character}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

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

          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{position: 'relative', width: '90%', maxWidth: '1000px', aspectRatio: '16/9'}}>
            <button 
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute', top: '-40px', right: 0,
                background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

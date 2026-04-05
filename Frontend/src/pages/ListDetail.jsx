import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listApi, movieApi } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function ListDetail() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await listApi.get(id);
        setList(data);
        
        if (data.movies && data.movies.length > 0) {
          const promises = data.movies.map(movieId => movieApi.getMovie(movieId).catch(() => null));
          const movieResults = await Promise.all(promises);
          setMovies(movieResults.filter(Boolean));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'80px', color:'var(--text-secondary)'}}>Loading list...</div>;
  if (error || !list) return <div style={{textAlign:'center', padding:'80px', color:'var(--red)'}}>{error || 'List not found'}</div>;

  return (
    <div className="container page-wrapper">
      <div style={{textAlign:'center', maxWidth:'600px', margin:'0 auto 40px'}}>
        <h1 style={{fontSize:'36px', fontWeight:'bold', marginBottom:'16px'}}>{list.name}</h1>
        <p style={{fontSize:'18px', color:'var(--text-secondary)', marginBottom:'24px'}}>{list.description}</p>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', color:'var(--text-secondary)', fontSize:'14px'}}>
          <Link to={`/profile/${list.userId?.username}`} style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-primary)'}}>
            <img 
              src={list.userId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} 
              alt={list.userId?.username} 
              style={{width:'24px', height:'24px', borderRadius:'50%'}}
            />
            {list.userId?.username}
          </Link>
          <span>•</span>
          <span>{movies.length} films</span>
        </div>
      </div>
      
      {movies.length > 0 ? (
        <div className="poster-grid">
          {movies.map((movie) => (
             <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{textAlign:'center', padding:'80px', color:'var(--text-secondary)'}}>
           <p>This list is empty.</p>
        </div>
      )}
    </div>
  );
}

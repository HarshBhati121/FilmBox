import { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import UserCard from '../components/UserCard';

export default function Members() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userApi.search(query || 'a');
        if (isMounted) setUsers(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchUsers();
    return () => { isMounted = false; };
  }, [query]);

  return (
    <div className="container page-wrapper" style={{maxWidth:'800px'}}>
      <h1 className="section-title">Members</h1>
      
      <div style={{marginBottom:'32px'}}>
        <input 
          type="text" 
          placeholder="Search for members by username..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control"
        />
      </div>

      {loading ? (
        <div style={{padding:'40px', color:'var(--text-secondary)'}}>Searching members...</div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
          {users.map(u => (
            <UserCard key={u._id} user={u} />
          ))}
          {users.length === 0 && (
            <div style={{padding:'40px', color:'var(--text-secondary)', fontStyle:'italic', gridColumn:'1 / -1'}}>No members found.</div>
          )}
        </div>
      )}
    </div>
  );
}

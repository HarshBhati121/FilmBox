import { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import UserCard from '../components/UserCard';

export default function Members() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userApi.search(trimmed);
        if (isMounted) setUsers(res || []);
      } catch (err) {
        console.error(err);
        if (isMounted) setUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="container page-wrapper members-page">
      <h1 className="section-title">Members</h1>

      <div className="members-search">
        <input
          type="text"
          placeholder="Search for members by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control"
        />
      </div>

      {loading ? (
        <div className="page-loading">Searching members...</div>
      ) : !query.trim() ? (
        <div className="members-empty">Search by username to find members.</div>
      ) : (
        <div className="members-grid">
          {users.map((u) => (
            <UserCard key={u._id} user={u} />
          ))}
          {users.length === 0 && (
            <div className="members-empty">No members found.</div>
          )}
        </div>
      )}
    </div>
  );
}

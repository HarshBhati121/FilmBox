import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listApi } from '../api/client';
import ListCard from '../components/ListCard';
import { Link } from 'react-router-dom';

export default function Lists() {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLists = async () => {
      setLoading(true);
      try {
        if (user) {
          const res = await listApi.getMyLists();
          if (isMounted) setLists(res || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLists();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">Your Lists</h1>
        {/* We can add a "Create List" button here later */}
      </div>

      {!user ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-lg mb-4">Sign in to create and view your custom film lists.</p>
          <Link to="/login" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-md font-medium transition-colors">Sign In</Link>
        </div>
      ) : loading ? (
        <div className="text-center p-12 text-gray-400">Loading lists...</div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lists.map(list => (
            <ListCard key={list._id} list={list} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-lg mb-4">You haven't created any lists yet.</p>
        </div>
      )}
    </div>
  );
}

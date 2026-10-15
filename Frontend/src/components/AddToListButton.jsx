import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listApi } from '../api/client';
import toast from 'react-hot-toast';

export default function AddToListButton({ movieId }) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    listApi.getMyLists().then(setLists).catch(() => setLists([]));
  }, [user]);

  if (!user) return null;

  const handleAdd = async (list) => {
    setSaving(true);
    try {
      await listApi.addMovie(list._id, Number(movieId));
      toast.success(`Added to ${list.name}`);
      setOpen(false);
    } catch (err) {
      toast.error(err.message || 'Could not add to list');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-to-list">
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%' }}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Cancel' : 'Add to a list'}
      </button>
      {open && (
        <div className="add-to-list-menu glass-panel">
          {lists.length === 0 ? (
            <p className="add-to-list-empty">Create a list first on the Lists page.</p>
          ) : (
            lists.map((list) => (
              <button
                key={list._id}
                type="button"
                className="add-to-list-item"
                disabled={saving}
                onClick={() => handleAdd(list)}
              >
                {list.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

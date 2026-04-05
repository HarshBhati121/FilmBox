export default function StarRating({ rating, setRating, max = 5 }) {
  return (
    <div style={{display:'flex', gap:'4px'}}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setRating(starValue)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '28px',
              transition: 'color 0.2s, transform 0.1s',
              color: starValue <= rating ? 'var(--accent-color)' : 'var(--glass-border)',
              padding: '0 2px'
            }}
            onMouseEnter={(e) => {
               e.target.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
               e.target.style.transform = 'scale(1)';
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

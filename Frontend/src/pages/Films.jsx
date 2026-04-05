export default function Films() {
  return (
    <div className="container">
      <h1 className="page-title">Films</h1>
      <p className="text-muted">Browse and search films. Add film endpoints to your backend to populate this page.</p>
      <div className="poster-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="poster-card">—</div>
        ))}
      </div>
    </div>
  );
}

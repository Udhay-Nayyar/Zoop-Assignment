export default function Skeleton({ rows = 5 }) {
  return (
    <div className="space-y-3" aria-label="Loading agents" role="status">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <span className="skeleton-block w-1/4" />
          <span className="skeleton-block w-1/5" />
          <span className="skeleton-block w-1/3" />
        </div>
      ))}
    </div>
  );
}

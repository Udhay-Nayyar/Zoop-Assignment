import { Skeleton as ShadcnSkeleton } from "../../components/ui/skeleton";

export default function Skeleton({ rows = 5 }) {
  return (
    <div aria-label="Loading agents" className="skeleton-table" role="status">
      <span className="sr-only">Loading agents</span>
      <div aria-hidden="true" className="skeleton-heading">
        {Array.from({ length: 7 }, (_, index) => <ShadcnSkeleton className="skeleton-block" key={index} />)}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div aria-hidden="true" className="skeleton-row" key={row}>
          {Array.from({ length: 7 }, (_, column) => (
            <ShadcnSkeleton className="skeleton-block" key={column} />
          ))}
        </div>
      ))}
    </div>
  );
}

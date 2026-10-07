import Link from "next/link";

export default function EmptyState({ filtered, onClear }) {
  return (
    <section className="state-panel">
      <div className="state-icon" aria-hidden="true">{filtered ? "⌕" : "+"}</div>
      <h2>{filtered ? "No agents match your filters" : "No agents yet"}</h2>
      <p>{filtered ? "Try adjusting your search or filters." : "Add your first delivery agent to get started."}</p>
      {filtered ? (
        <button className="button button-secondary" onClick={onClear} type="button">Clear filters</button>
      ) : (
        <Link className="button button-primary" href="/agents/new">Add agent</Link>
      )}
    </section>
  );
}

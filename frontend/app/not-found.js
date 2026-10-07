import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell not-found-page">
      <div className="state-icon" aria-hidden="true">?</div>
      <h1>Page not found</h1>
      <p>We couldn’t find the page you were looking for.</p>
      <Link className="button button-primary" href="/agents">Back to agents</Link>
    </main>
  );
}

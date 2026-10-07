"use client";

export default function GlobalError({ reset }) {
  return (
    <main className="page-shell not-found-page" role="alert">
      <div className="state-icon" aria-hidden="true">!</div>
      <h1>Something went wrong</h1>
      <p>The page could not be displayed. Please try again.</p>
      <button className="button button-primary" onClick={() => reset()} type="button">Try again</button>
    </main>
  );
}

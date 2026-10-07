export default function ErrorState({ message, onRetry }) {
  return (
    <section className="state-panel state-error" role="alert">
      <div className="state-icon" aria-hidden="true">!</div>
      <h2>We couldn’t load this information</h2>
      <p>{message || "Something went wrong. Please try again."}</p>
      <button className="button button-primary" onClick={onRetry} type="button">Retry</button>
    </section>
  );
}

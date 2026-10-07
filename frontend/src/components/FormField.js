export default function FormField({ id, label, error, children, hint }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : hint ? hintId : undefined })}
      {hint && !error && <p className="field-hint" id={hintId}>{hint}</p>}
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  );
}

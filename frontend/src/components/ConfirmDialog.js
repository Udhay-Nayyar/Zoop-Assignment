"use client";

import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, title, children, onCancel, onConfirm, busy, error }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll("button:not([disabled]), [href], input:not([disabled])");
    focusable[0]?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) onCancel();
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <section aria-modal="true" className="dialog-panel" ref={dialogRef} role="dialog" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <div className="dialog-content">{children}</div>
        {error && <p className="form-error-banner" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button className="button button-secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button className="button button-danger" disabled={busy} onClick={onConfirm} type="button">{busy ? "Deleting…" : "Delete"}</button>
        </div>
      </section>
    </div>
  );
}

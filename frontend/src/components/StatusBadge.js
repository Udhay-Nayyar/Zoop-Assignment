export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status === "active" ? "status-active" : "status-inactive"}`}>
      <span aria-hidden="true" className="status-dot" />
      {status}
    </span>
  );
}

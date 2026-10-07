import { Badge } from "../../components/ui/badge";

export default function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <Badge className={`status-text !h-auto !rounded-none !border-0 !bg-transparent !px-0 !py-0 ${active ? "status-active" : "status-inactive"}`} variant="outline">
      <span aria-hidden="true" className="status-dot" />
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

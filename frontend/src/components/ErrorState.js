import { CircleAlert } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function ErrorState({ message, onRetry }) {
  const notFound = message === "Agent not found";
  return (
    <section className="state-panel state-error" role="alert">
      <span aria-hidden="true" className="state-icon"><CircleAlert size={19} /></span>
      <h2>{notFound ? "Agent not found" : "Couldn't load agents"}</h2>
      {!notFound && <p>{message || "Check your connection and try again."}</p>}
      {onRetry && <Button onClick={onRetry} type="button" variant="outline">Retry</Button>}
    </section>
  );
}

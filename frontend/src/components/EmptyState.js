import Link from "next/link";
import { Search, UsersRound } from "lucide-react";
import { Button, buttonVariants } from "../../components/ui/button";

export default function EmptyState({ filtered, onClear }) {
  const Icon = filtered ? Search : UsersRound;
  return (
    <section className="state-panel">
      <span aria-hidden="true" className="state-icon"><Icon size={19} /></span>
      <h2>{filtered ? "No agents match these filters" : "No agents yet"}</h2>
      <p>{filtered ? "Try changing your search or filters." : "Add an agent to start building your team list."}</p>
      {filtered ? (
        <Button onClick={onClear} type="button" variant="outline">Clear filters</Button>
      ) : (
        <Link className={buttonVariants()} href="/agents/new">Add agent</Link>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useAgent from "../../../../src/hooks/useAgent";
import AgentForm from "../../../../src/components/AgentForm";
import Skeleton from "../../../../src/components/Skeleton";
import ErrorState from "../../../../src/components/ErrorState";

export default function EditAgentPage() {
  const { id } = useParams();
  const { agent, error, loading, reload } = useAgent(id);

  if (loading) return <main className="page-shell form-shell"><Skeleton rows={4} /></main>;
  if (error?.status === 404) return <main className="page-shell form-shell"><ErrorState message="Agent not found" onRetry={reload} /></main>;
  if (error) return <main className="page-shell form-shell"><ErrorState message={error.message} onRetry={reload} /></main>;
  if (!agent) return null;

  return (
    <main className="page-shell form-shell">
      <Link className="back-link" href={`/agents/${agent.id}`}>← Back to agent</Link>
      <div className="page-heading"><div><p className="eyebrow">TEAM</p><h1>Edit agent</h1><p className="page-subtitle">Update {agent.fullName}’s details.</p></div></div>
      <AgentForm initialAgent={agent} mode="edit" />
    </main>
  );
}

"use client";

import Link from "next/link";
import AgentForm from "../../../src/components/AgentForm";

export default function NewAgentPage() {
  return (
    <main className="page-shell form-shell">
      <Link className="back-link" href="/agents">← Back to agents</Link>
      <div className="page-heading"><div><p className="eyebrow">TEAM</p><h1>Add an agent</h1><p className="page-subtitle">Enter the details for a new delivery agent.</p></div></div>
      <AgentForm />
    </main>
  );
}

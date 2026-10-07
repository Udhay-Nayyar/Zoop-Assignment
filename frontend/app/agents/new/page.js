"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AgentForm from "../../../src/components/AgentForm";

export default function NewAgentPage() {
  return (
    <main className="page-shell form-shell">
      <Link className="back-link" href="/agents"><ArrowLeft aria-hidden="true" size={14} />Back to agents</Link>
      <div className="page-heading"><div><p className="eyebrow">Team directory</p><h1>Add an agent</h1><p className="page-subtitle">Enter the details for a new delivery agent.</p></div></div>
      <AgentForm />
    </main>
  );
}

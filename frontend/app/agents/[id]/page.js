"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useAgent from "../../../src/hooks/useAgent";
import StatusBadge from "../../../src/components/StatusBadge";
import Skeleton from "../../../src/components/Skeleton";
import ErrorState from "../../../src/components/ErrorState";
import ConfirmDialog from "../../../src/components/ConfirmDialog";
import { deleteAgent, ApiError } from "../../../src/lib/api";
import { useToast } from "../../../src/components/Toast";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

export default function AgentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { agent, error, loading, reload } = useAgent(id);
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const triggerRef = useRef(null);

  async function confirmDelete() {
    setBusy(true);
    setDialogError("");
    try {
      await deleteAgent(id);
      showToast("Agent deleted");
      router.push("/agents");
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 404) {
        showToast("Agent was already deleted");
        router.push("/agents");
      } else setDialogError(deleteError.message || "Unable to delete this agent.");
    } finally {
      setBusy(false);
    }
  }
  function closeDialog() {
    setDialogOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  if (loading) return <main className="page-shell form-shell"><Skeleton rows={4} /></main>;
  if (error?.status === 404) return <main className="page-shell form-shell"><ErrorState message="Agent not found" onRetry={reload} /></main>;
  if (error) return <main className="page-shell form-shell"><ErrorState message={error.message} onRetry={reload} /></main>;
  if (!agent) return null;

  return (
    <main className="page-shell form-shell">
      <Link className="back-link" href="/agents">← Back to agents</Link>
      <section className="detail-card">
        <div className="detail-heading">
          <div><p className="eyebrow">AGENT PROFILE</p><h1>{agent.fullName}</h1><StatusBadge status={agent.status} /></div>
          <div className="detail-actions"><Link className="button button-secondary" href={`/agents/${agent.id}/edit`}>Edit</Link><button className="button button-danger" onClick={(event) => { triggerRef.current = event.currentTarget; setDialogOpen(true); }} type="button">Delete</button></div>
        </div>
        <dl className="detail-grid">
          <div className="detail-item"><dt>Phone</dt><dd>{agent.phone}</dd></div>
          <div className="detail-item"><dt>Email</dt><dd>{agent.email}</dd></div>
          <div className="detail-item"><dt>Service area</dt><dd>{agent.serviceArea}</dd></div>
          <div className="detail-item"><dt>Agent ID</dt><dd>{agent.id}</dd></div>
          <div className="detail-item"><dt>Created</dt><dd>{formatDate(agent.createdAt)}</dd></div>
          <div className="detail-item"><dt>Last updated</dt><dd>{formatDate(agent.updatedAt)}</dd></div>
        </dl>
      </section>
      <ConfirmDialog open={dialogOpen} title={`Delete "${agent.fullName}"? This cannot be undone.`} onCancel={closeDialog} onConfirm={confirmDelete} busy={busy} error={dialogError}>
        <p>The agent will be permanently removed from the system.</p>
      </ConfirmDialog>
    </main>
  );
}

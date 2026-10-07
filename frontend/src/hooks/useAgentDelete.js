"use client";

import { useRef, useState } from "react";
import { ApiError, deleteAgent } from "../lib/api";
import { useToast } from "../components/Toast";

export default function useAgentDelete(onDeleted) {
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const trigger = useRef(null);
  const { showToast } = useToast();

  function open(agentToDelete, event) {
    trigger.current = event.currentTarget;
    setAgent(agentToDelete);
  }

  function close() {
    setAgent(null);
    setError("");
    requestAnimationFrame(() => trigger.current?.focus());
  }

  async function confirm() {
    if (!agent) return;
    setBusy(true);
    setError("");
    try {
      await deleteAgent(agent.id);
      showToast("Agent deleted");
      setAgent(null);
      onDeleted();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 404) {
        showToast("Agent was already deleted");
        setAgent(null);
        onDeleted();
      } else {
        setError(requestError.message || "Unable to delete this agent.");
      }
    } finally {
      setBusy(false);
    }
  }

  return { agent, error, busy, open, close, confirm };
}

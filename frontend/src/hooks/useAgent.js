"use client";

import { useCallback, useEffect, useState } from "react";
import { getAgent } from "../lib/api";

export default function useAgent(id) {
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadId, setReloadId] = useState(0);
  const reload = useCallback(() => setReloadId((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getAgent(id, { signal: controller.signal })
      .then(setAgent)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadId]);

  return { agent, error, loading, reload };
}

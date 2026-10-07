"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listAgents } from "../lib/api";

export default function useAgents(params) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reloadId, setReloadId] = useState(0);
  const hasResult = useRef(false);
  const query = JSON.stringify(params);

  const reload = useCallback(() => setReloadId((id) => id + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    if (hasResult.current) setUpdating(true);
    else setLoading(true);

    listAgents(JSON.parse(query), { signal: controller.signal })
      .then((response) => {
        hasResult.current = true;
        setResult(response);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setUpdating(false);
        }
      });

    return () => controller.abort();
  }, [query, reloadId]);

  return { ...result, error, loading, updating, reload };
}

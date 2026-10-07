"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useAgents from "../hooks/useAgents";
import useDebounce from "../hooks/useDebounce";
import useAgentDelete from "../hooks/useAgentDelete";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Pagination from "./Pagination";
import ConfirmDialog from "./ConfirmDialog";
import AgentFilters from "./AgentFilters";
import AgentResults from "./AgentResults";

const defaultState = { page: 1, limit: 10, sortBy: "createdAt", order: "desc" };

function readState(searchParams) {
  return {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    status: searchParams.get("status") || "",
    serviceArea: searchParams.get("serviceArea") || "",
    q: searchParams.get("q") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") || "desc"
  };
}

function AgentListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => readState(searchParams), [searchParams]);
  const stateRef = useRef(state);
  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedSearch = useDebounce(searchInput);
  const skipSearchCommit = useRef(false);
  const params = {
    page: state.page,
    limit: state.limit,
    status: state.status,
    serviceArea: state.serviceArea,
    q: state.q,
    sortBy: state.sortBy,
    order: state.order
  };
  const result = useAgents(params);
  const items = result.data || [];
  const total = result.meta?.total || 0;
  const totalPages = result.meta?.totalPages || 0;
  const deletion = useAgentDelete(result.reload);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    skipSearchCommit.current = true;
    setSearchInput(state.q);
  }, [state.q]);

  const updateUrl = useCallback((changes, { resetPage = false, replace = false } = {}) => {
    const next = { ...stateRef.current, ...changes };
    if (resetPage) next.page = 1;
    stateRef.current = next;
    const query = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null || value === defaultState[key]) return;
      query.set(key, String(value));
    });
    const url = `${pathname}${query.size ? `?${query.toString()}` : ""}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    if (debouncedSearch === state.q) {
      skipSearchCommit.current = false;
      return;
    }
    if (skipSearchCommit.current) {
      skipSearchCommit.current = false;
      return;
    }
    updateUrl({ q: debouncedSearch }, { resetPage: true, replace: false });
  }, [debouncedSearch, state.q, updateUrl]);

  useEffect(() => {
    if (!result.meta) return;
    if (totalPages === 0 && state.page !== 1) updateUrl({ page: 1 }, { replace: true });
    else if (totalPages > 0 && state.page > totalPages) updateUrl({ page: totalPages }, { replace: true });
  }, [result.meta, state.page, totalPages, updateUrl]);

  function clearFilters() {
    setSearchInput("");
    router.push("/agents", { scroll: false });
  }

  const filtersActive = Boolean(state.q || state.status || state.serviceArea);

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div><p className="eyebrow">OPERATIONS</p><h1>Delivery agents</h1><p className="page-subtitle">Manage your delivery team and service coverage.</p></div>
        <Link className="button button-primary hidden sm:inline-flex" href="/agents/new">＋ Add agent</Link>
      </div>
      <AgentFilters
        state={state}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        updateUrl={updateUrl}
        filtersActive={filtersActive}
        clearFilters={clearFilters}
      />
      <div aria-live="polite" className="table-topline">{result.updating && <span className="updating-label">Updating results…</span>}</div>
      {result.loading && !result.meta ? <Skeleton rows={6} /> : result.error && !result.meta ? <ErrorState message={result.error.message} onRetry={result.reload} /> : items.length === 0 ? <EmptyState filtered={filtersActive} onClear={clearFilters} /> : (
        <>
          <AgentResults items={items} updating={result.updating} onDelete={deletion.open} />
          <Pagination page={state.page} totalPages={totalPages} total={total} limit={state.limit} onPageChange={(page) => updateUrl({ page })} />
        </>
      )}
      <ConfirmDialog open={Boolean(deletion.agent)} title={`Delete "${deletion.agent?.fullName}"? This cannot be undone.`} onCancel={deletion.close} onConfirm={deletion.confirm} busy={deletion.busy} error={deletion.error}>
        <p>The agent will be permanently removed from the system.</p>
      </ConfirmDialog>
    </main>
  );
}

export default function AgentList() {
  return <Suspense fallback={<main className="page-shell"><Skeleton rows={6} /></main>}><AgentListContent /></Suspense>;
}

"use client";

import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];
const sortOptions = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "fullName:asc", label: "Name A–Z" },
  { value: "fullName:desc", label: "Name Z–A" }
];
const rowOptions = ["10", "25", "50"].map((value) => ({ value, label: value }));

export default function AgentFilters({
  state,
  searchInput,
  setSearchInput,
  updateUrl,
  filtersActive,
  clearFilters
}) {
  return (
    <section aria-label="Agent list filters" className="filter-card">
      <div className="filter-grid">
        <label className="control-group search-control">
          <span id="search-agents-label">Search agents</span>
          <div className="search-input-wrap">
            <Search aria-hidden="true" size={15} />
            <Input aria-labelledby="search-agents-label" placeholder="Name, email, phone, area" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          </div>
        </label>
        <label className="control-group">
          <span id="status-filter-label">Status</span>
          <Select items={statusOptions} value={state.status || "all"} onValueChange={(value) => updateUrl({ status: value === "all" ? "" : value }, { resetPage: true })}>
            <SelectTrigger aria-labelledby="status-filter-label" className="control-select-trigger">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="control-group">
          <span id="service-area-label">Service area</span>
          <Input aria-labelledby="service-area-label" maxLength={120} placeholder="Any area" value={state.serviceArea} onChange={(event) => updateUrl({ serviceArea: event.target.value }, { resetPage: true })} />
        </label>
        <label className="control-group">
          <span id="sort-by-label">Sort by</span>
          <Select items={sortOptions} value={`${state.sortBy}:${state.order}`} onValueChange={(value) => {
            const [sortBy, order] = value.split(":");
            updateUrl({ sortBy, order }, { resetPage: true });
          }}>
            <SelectTrigger aria-labelledby="sort-by-label" className="control-select-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="createdAt:asc">Oldest first</SelectItem>
              <SelectItem value="updatedAt:desc">Recently updated</SelectItem>
              <SelectItem value="fullName:asc">Name A–Z</SelectItem>
              <SelectItem value="fullName:desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="control-group rows-control">
          <span id="rows-label">Rows</span>
          <Select items={rowOptions} value={String(state.limit)} onValueChange={(value) => updateUrl({ limit: Number(value) }, { resetPage: true })}>
            <SelectTrigger aria-labelledby="rows-label" className="control-select-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      {filtersActive && <Button className="clear-filters" onClick={clearFilters} size="sm" type="button" variant="link">Clear filters</Button>}
    </section>
  );
}

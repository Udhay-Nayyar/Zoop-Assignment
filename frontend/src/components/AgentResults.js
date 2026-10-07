"use client";

import { useRef } from "react";
import Link from "next/link";
import { Ellipsis, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import StatusBadge from "./StatusBadge";
import { formatFullDate, formatRelativeDate, getInitials } from "../lib/formatDate";

function AgentIdentity({ agent }) {
  return (
    <div className="agent-name-cell">
      <span aria-hidden="true" className="agent-avatar">{getInitials(agent.fullName)}</span>
      <span className="agent-name-copy">
        <Link className="agent-name" href={`/agents/${agent.id}`}>{agent.fullName}</Link>
        <span className="agent-secondary">{agent.email}</span>
      </span>
    </div>
  );
}

function CreatedDate({ value }) {
  return <span className="agent-secondary" title={formatFullDate(value)}>{formatRelativeDate(value)}</span>;
}

function MobileActions({ agent, onDelete }) {
  const triggerRef = useRef(null);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label={`Actions for ${agent.fullName}`} className="mobile-actions-trigger" ref={triggerRef} size="icon" variant="ghost" />}
      >
        <Ellipsis aria-hidden="true" size={17} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem render={<Link href={`/agents/${agent.id}`} />}>
          <ExternalLink aria-hidden="true" />
          View agent
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/agents/${agent.id}/edit`} />}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => onDelete(agent, { currentTarget: triggerRef.current, event })}
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AgentResults({ items, updating, onDelete }) {
  const updatingClass = updating ? "is-updating" : "";
  return (
    <>
      <div className={`table-wrap ${updatingClass}`}>
        <Table className="agent-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Service area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell><AgentIdentity agent={agent} /></TableCell>
                <TableCell>{agent.phone}</TableCell>
                <TableCell>{agent.serviceArea}</TableCell>
                <TableCell><StatusBadge status={agent.status} /></TableCell>
                <TableCell><CreatedDate value={agent.createdAt} /></TableCell>
                <TableCell>
                  <div className="row-actions">
                    <Link aria-label={`Edit ${agent.fullName}`} className="action-link" href={`/agents/${agent.id}/edit`} title="Edit">
                      <Pencil aria-hidden="true" size={14} />
                    </Link>
                    <Button aria-label={`Delete ${agent.fullName}`} onClick={(event) => onDelete(agent, event)} size="icon-sm" title="Delete" variant="ghost">
                      <Trash2 aria-hidden="true" size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={`agent-cards ${updatingClass}`}>
        {items.map((agent) => (
          <article className="agent-card" key={agent.id}>
            <div className="agent-card-heading">
              <Link className="agent-name" href={`/agents/${agent.id}`}>{agent.fullName}</Link>
              <StatusBadge status={agent.status} />
            </div>
            <p className="agent-card-detail">{agent.phone}</p>
            <p className="agent-card-detail">{agent.serviceArea}</p>
            <MobileActions agent={agent} onDelete={onDelete} />
          </article>
        ))}
      </div>
    </>
  );
}

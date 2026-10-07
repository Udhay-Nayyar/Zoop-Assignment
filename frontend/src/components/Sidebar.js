"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UsersRound } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const agentsActive = pathname === "/agents" || pathname.startsWith("/agents/");

  return (
    <aside className="sidebar">
      <Link className="sidebar-brand" href="/agents">
        <span aria-hidden="true" className="brand-mark"><UsersRound size={17} /></span>
        <span className="brand-copy">
          <strong>Delivery Ops</strong>
          <span>Agent management</span>
        </span>
      </Link>
      <p className="sidebar-label">Workspace</p>
      <nav aria-label="Main navigation" className="sidebar-nav">
        <Link aria-current={agentsActive ? "page" : undefined} className="sidebar-link" data-active={agentsActive} href="/agents">
          <UsersRound aria-hidden="true" size={16} />
          <span>Agents</span>
        </Link>
      </nav>
      <p className="sidebar-footer">Internal operations tool</p>
    </aside>
  );
}

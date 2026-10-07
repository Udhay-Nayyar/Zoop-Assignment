import "./globals.css";
import Link from "next/link";
import { ToastProvider } from "../src/components/Toast";

export const metadata = {
  title: "Delivery Agent Management",
  description: "Manage your delivery agents and service areas."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <header className="app-header">
            <div className="header-inner">
              <Link className="brand" href="/agents"><span aria-hidden="true" className="brand-mark">↗</span><span>Delivery Agent Management</span></Link>
              <nav aria-label="Main navigation" className="header-actions">
                <Link className="header-link" href="/agents">Agents</Link>
                <Link className="button button-primary" href="/agents/new">＋ Add agent</Link>
              </nav>
            </div>
          </header>
          {children}
          <footer className="site-footer">Delivery Agent Management System</footer>
        </ToastProvider>
      </body>
    </html>
  );
}

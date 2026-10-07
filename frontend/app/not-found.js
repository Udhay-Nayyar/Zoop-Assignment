import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "../components/ui/button";

export default function NotFound() {
  return (
    <main className="page-shell not-found-page">
      <span className="state-icon" aria-hidden="true"><FileQuestion size={19} /></span>
      <h1>Page not found</h1>
      <p>We couldn’t find the page you were looking for.</p>
      <Link className={buttonVariants()} href="/agents">Back to agents</Link>
    </main>
  );
}

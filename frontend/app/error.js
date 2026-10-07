"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export default function GlobalError({ reset }) {
  return (
    <main className="page-shell not-found-page" role="alert">
      <span className="state-icon" aria-hidden="true"><CircleAlert size={19} /></span>
      <h1>Couldn’t load this page</h1>
      <p>The page could not be displayed. Please try again.</p>
      <Button onClick={() => reset()} type="button">Retry</Button>
    </main>
  );
}

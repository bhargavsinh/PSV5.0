import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);

  return (
    <main className="p-8">
      <p>Opening Pushti Sahitya…</p>
      <p>
        <a href="/index.html">Continue to the library</a>
      </p>
    </main>
  );
}

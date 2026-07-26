"use client";

// A Client Component: server-rendered to HTML for the first paint, then
// hydrated in the browser — React attaches state and event handlers to the
// existing markup instead of re-creating it.
import { useEffect, useState } from "react";

export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [hydratedAt, setHydratedAt] = useState<string | null>(null);

  // Effects only run after hydration, so this timestamps the takeover moment.
  useEffect(() => {
    setHydratedAt(new Date().toLocaleTimeString());
  }, []);

  return (
    <section>
      <p>
        Count: <strong>{count}</strong>{" "}
        <button onClick={() => setCount(count + 1)}>+1</button>
      </p>
      <p>
        {hydratedAt
          ? `Hydrated at ${hydratedAt} — the button is live, and no reload happened.`
          : "Server-rendered HTML — not interactive yet…"}
      </p>
    </section>
  );
}

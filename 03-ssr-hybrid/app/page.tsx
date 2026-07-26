import { Counter } from "./Counter";

// A Server Component: this code runs ONLY on the server. Its output is HTML.
export const dynamic = "force-dynamic"; // re-render per request so the SSR timestamp is honest

async function getInitialCount(): Promise<number> {
  // Stand-in for a real database/API call made during server rendering.
  return 5;
}

export default async function Page() {
  const initialCount = await getInitialCount();
  const renderedAt = new Date().toLocaleTimeString();

  return (
    <main>
      <h1>SSR + Hydration (Next.js)</h1>
      <p>
        This page was rendered on the <strong>server</strong> at {renderedAt}.
        View source: the content and the initial count ({initialCount}) are
        already in the HTML — that&apos;s SSR.
      </p>
      {/* The interactive island: server-rendered as HTML, then hydrated. */}
      <Counter initialCount={initialCount} />
    </main>
  );
}

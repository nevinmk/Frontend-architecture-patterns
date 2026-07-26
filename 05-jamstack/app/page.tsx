import { QuoteWidget } from "./QuoteWidget";

// With `output: "export"` this component runs ONCE, at build time.
// The result is a static HTML file — there is no server at request time.
const POSTS = ["Why static is fast", "CDNs explained", "APIs for the rest"];

export default function Page() {
  const builtAt = new Date().toLocaleString();

  return (
    <main>
      <h1>JAMstack (Next.js static export)</h1>
      <p>
        This page was generated at <strong>build time</strong> ({builtAt}) and is
        served as a plain file from out/ — reload all you want, the timestamp
        won&apos;t change until you rebuild and redeploy.
      </p>
      <h2>Posts (pre-rendered at build time)</h2>
      <ul>
        {POSTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {/* The "A" in JAM: dynamic data comes from APIs at runtime, client-side. */}
      <QuoteWidget />
    </main>
  );
}

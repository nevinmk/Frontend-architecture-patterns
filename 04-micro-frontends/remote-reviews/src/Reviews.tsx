// Team C's component. It runs twice: on the server (renderToString) for the
// first paint, then in the browser (hydrateRoot) to attach the handlers. Both
// passes must produce the same markup, so everything rendered before the
// effect runs comes from `initial` — no Date.now(), no random ids.
import { useEffect, useState } from "react";
import type { ReviewsData } from "./data";

export function Reviews({ initial }: { initial: ReviewsData }) {
  const [reviews, setReviews] = useState(initial.reviews);
  const [interactive, setInteractive] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    setInteractive(true); // effects never run on the server — this is "hydrated"
    // Same loose coupling as the other remotes: listen for the DOM event, import nothing.
    const onAdd = (e: Event) => setJustAdded((e as CustomEvent<string>).detail);
    window.addEventListener("add-to-cart", onAdd);
    return () => window.removeEventListener("add-to-cart", onAdd);
  }, []);

  const markHelpful = (id: number) =>
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)));

  return (
    <section>
      <h2>
        Reviews <small>(Team C, server-rendered)</small>
      </h2>
      <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
        HTML rendered on the server at {initial.renderedAt.slice(11, 23)} UTC ·{" "}
        {interactive ? "hydrated — buttons are live" : "not hydrated yet (buttons inert)"}
      </p>
      {reviews.map((r) => (
        <p
          key={r.id}
          style={{ fontWeight: r.product === justAdded ? "bold" : "normal" }}
        >
          <strong>{r.product}</strong> — {r.text} <em>({r.author})</em>{" "}
          <button disabled={!interactive} onClick={() => markHelpful(r.id)}>
            Helpful ({r.helpful})
          </button>
        </p>
      ))}
    </section>
  );
}

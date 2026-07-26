"use client";

// The dynamic part of a JAMstack site: the static page calls an API from the
// browser at runtime. Here the "API" is a static JSON endpoint; in real life
// it would be a serverless function, headless CMS, Stripe, Algolia, etc.
import { useEffect, useState } from "react";

export function QuoteWidget() {
  const [quote, setQuote] = useState<string>("Loading…");
  const [fetchedAt, setFetchedAt] = useState<string>("");

  useEffect(() => {
    fetch("/api/quote.json")
      .then((r) => r.json())
      .then((data: { quotes: string[] }) => {
        setQuote(data.quotes[Math.floor(Math.random() * data.quotes.length)]);
        setFetchedAt(new Date().toLocaleTimeString());
      })
      .catch(() => setQuote("API unavailable."));
  }, []);

  return (
    <section>
      <h2>Quote (fetched from an API at runtime)</h2>
      <blockquote>{quote}</blockquote>
      {fetchedAt && (
        <p>
          <small>Fetched at {fetchedAt} — reload and this part changes while the
          pre-rendered HTML above stays frozen.</small>
        </p>
      )}
    </section>
  );
}

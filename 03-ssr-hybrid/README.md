# 03 — SSR / Hybrid (server render + client hydration)

The "best of both" architecture that modern frameworks (Next.js, Nuxt, SvelteKit,
Astro, Qwik) are built around. The **server renders real HTML for the first paint**
(fast load, SEO-friendly, like an MPA), then the browser downloads JavaScript that
**hydrates** that HTML — attaches event listeners and takes over — so from then on
it behaves like an SPA.

```
Browser ──GET /──▶ Server renders full HTML (content visible immediately)
                    └─ + <script> client.js
Browser runs client.js ──▶ "hydration": same UI becomes interactive, no reload
```

Variants on the same idea:
- **SSG** — render at build time instead of per request (see [05-jamstack](../05-jamstack/)).
- **Islands architecture** (Astro) — hydrate only the interactive widgets, ship zero JS for the rest.
- **Streaming SSR / React Server Components** — send HTML in chunks, keep some components server-only.

## Pros / Cons

| Pros | Cons |
|---|---|
| Fast first paint **and** app-like feel after | Most complex of the six: code runs in two places |
| SEO-friendly real HTML | Server and client must render identically (hydration mismatches) |
| Works (read-only) before/without JS | You ship the UI twice: as HTML and as JS |
| One codebase for server + client views | Needs a Node (or edge) runtime, not just static hosting |

**Use when:** public-facing sites that also need rich interactivity — e-commerce,
news, marketing + product apps.

## Demo

A Next.js (App Router) app. [app/page.tsx](app/page.tsx) is a **Server
Component** — it runs only on the server and its output arrives as HTML (view
source: the initial count is already there). [app/Counter.tsx](app/Counter.tsx)
is a **Client Component** (`"use client"`): server-rendered for the first paint,
then hydrated — the page tells you the moment the button comes alive.

```sh
npm install
npm run dev            # or: npm run build && npm start
# open http://localhost:3003
```

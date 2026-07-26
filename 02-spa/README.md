# 02 — Single-Page App (SPA)

The server sends **one HTML shell, once**. From then on, JavaScript owns the app:
it intercepts navigation, swaps views in and out of the DOM, and fetches data as
JSON. The page never fully reloads.

Classic examples: React, Vue, Angular apps (this demo uses vanilla JS to show the
pattern without a framework).

```
Browser ──GET /──▶ Server (empty shell + JS bundle)
Browser JS: route change ──▶ render view into <div id="app"> (no reload)
```

## Traits

- **Rendering:** client, at runtime.
- **Routing:** client-side router (this demo uses `#hash` routes).
- **State:** lives in the browser (component state, stores).
- **Server:** demoted to a static file host + JSON API.

## Pros / Cons

| Pros | Cons |
|---|---|
| App-like, instant navigations | Blank page until JS loads and runs |
| Rich, stateful interactivity | SEO needs extra work (crawlers see an empty shell) |
| Clear API/frontend separation | Large JS bundles hurt first load |
| State persists across views | Requires JavaScript, always |

**Use when:** dashboards, editors, tools behind a login — apps, not documents.

## Demo

A Vite + React + React Router app. The server only ever sends
[index.html](index.html) — an empty `<div id="root">` — and React Router owns
navigation from there. Click the nav: views swap instantly, but the "page loaded
at" timestamp **never changes** because the page never reloads. The counter
survives navigation — that's client-side state ([src/App.tsx](src/App.tsx)).

```sh
npm install
npm run dev
# open http://localhost:3002
```

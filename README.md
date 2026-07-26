# Frontend Architectures

Six major application-level frontend architectures. Each is a **standalone React
project** with its own `package.json`, built with the industry-standard tool for
that architecture, plus a README explaining the pattern, its trade-offs, and what
to look for in the demo.

| Folder | Architecture | Stack | Port |
|---|---|---|---|
| [01-mpa](01-mpa/) | Multi-Page App (server-rendered) | Express + React (`renderToStaticMarkup`) | 3001 |
| [02-spa](02-spa/) | Single-Page App | Vite + React + React Router | 3002 |
| [03-ssr-hybrid](03-ssr-hybrid/) | SSR / Hybrid (hydration) | Next.js (App Router) | 3003 |
| [04-micro-frontends](04-micro-frontends/) | Micro-Frontends | Vite + Module Federation (shell + 2 remotes) | 3004 (+3041, 3042) |
| [05-jamstack](05-jamstack/) | JAMstack / Static-first | Next.js `output: "export"` + static host | 3005 |
| [06-pwa](06-pwa/) | Progressive Web App | Vite + React + vite-plugin-pwa | 3006 |

## How they relate

- **01–05** are alternative answers to "*where and when is the HTML produced?*"
  (server per request → client at runtime → server + client → per team → build time).
- **06 (PWA)** is orthogonal: a delivery layer (service worker + manifest) that
  can wrap any of the others.

## Browse everything from one page

A hub page at **http://localhost:3000** links to every app and shows a live
green/red status dot per app.

```sh
# one-time setup: install each project's dependencies
cd 01-mpa && npm install && cd ..
cd 02-spa && npm install && cd ..
cd 03-ssr-hybrid && npm install && cd ..
cd 04-micro-frontends/remote-products && npm install && cd ../..
cd 04-micro-frontends/remote-cart && npm install && cd ../..
cd 04-micro-frontends/shell && npm install && cd ../..
cd 05-jamstack && npm install && cd ..
cd 06-pwa && npm install && cd ..
npm install                    # root: the `concurrently` runner

# one-time: pre-build the two that serve build output (JAMstack + PWA)
npm run setup

# run everything (hub + all six apps) in one terminal
npm run dev
# open http://localhost:3000
```

Each app also runs on its own — `cd` into its folder and follow its README.

---

# Architecture guides

The full guide for each architecture, mirrored from its folder's README.

## 01 — Multi-Page App (MPA, server-rendered)

The oldest and still most common architecture. **Every URL is a separate page, and
every navigation is a full page load.** The server receives the request, builds the
complete HTML (often from templates + database data), and sends it back. The browser
throws away the old page and renders the new one.

Classic examples: Rails, Django, Laravel/PHP, JSP — and this demo's Express server.

```
Browser ──GET /about──▶ Server (builds full HTML) ──▶ Browser renders new page
```

### Traits

- **Rendering:** server, on every request.
- **Routing:** the server's job (URL → handler → HTML).
- **State:** lives on the server (session, DB); the browser is mostly stateless.
- **JavaScript:** optional "sprinkles" for interactivity, not required for the app to work.

### Pros / Cons

| Pros | Cons |
|---|---|
| Simple mental model, one codebase | Full reload on every navigation (slower feel) |
| Great SEO by default | Hard to build app-like, highly interactive UIs |
| Works without JavaScript | Server does all rendering work per request |
| Fast first paint | UI state lost between pages unless persisted |

**Use when:** content sites, admin panels, forms-and-tables apps, anything where
per-page interactivity is modest.

### Demo

An Express server where **React is used purely as a server-side templating
engine**: each route renders a page component with `renderToStaticMarkup` and
returns a complete HTML document. No JavaScript is shipped to the browser at
all — watch the full page reload (and the server timestamp change) as you click
the nav links.

Key files: [src/server.tsx](01-mpa/src/server.tsx) (routes), [src/pages.tsx](01-mpa/src/pages.tsx)
(page components), [src/Layout.tsx](01-mpa/src/Layout.tsx) (shared shell).

```sh
npm install
npm run dev        # tsx watch — restarts on change
# open http://localhost:3001
```

---

## 02 — Single-Page App (SPA)

The server sends **one HTML shell, once**. From then on, JavaScript owns the app:
it intercepts navigation, swaps views in and out of the DOM, and fetches data as
JSON. The page never fully reloads.

Classic examples: React, Vue, Angular apps — here, Vite + React + React Router.

```
Browser ──GET /──▶ Server (empty shell + JS bundle)
Browser JS: route change ──▶ render view into <div id="app"> (no reload)
```

### Traits

- **Rendering:** client, at runtime.
- **Routing:** client-side router (React Router here).
- **State:** lives in the browser (component state, stores).
- **Server:** demoted to a static file host + JSON API.

### Pros / Cons

| Pros | Cons |
|---|---|
| App-like, instant navigations | Blank page until JS loads and runs |
| Rich, stateful interactivity | SEO needs extra work (crawlers see an empty shell) |
| Clear API/frontend separation | Large JS bundles hurt first load |
| State persists across views | Requires JavaScript, always |

**Use when:** dashboards, editors, tools behind a login — apps, not documents.

### Demo

A Vite + React + React Router app. The server only ever sends
[index.html](02-spa/index.html) — an empty `<div id="root">` — and React Router owns
navigation from there. Click the nav: views swap instantly, but the "page loaded
at" timestamp **never changes** because the page never reloads. The counter
survives navigation — that's client-side state ([src/App.tsx](02-spa/src/App.tsx)).

```sh
npm install
npm run dev
# open http://localhost:3002
```

---

## 03 — SSR / Hybrid (server render + client hydration)

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
- **SSG** — render at build time instead of per request (see [05-jamstack](05-jamstack/)).
- **Islands architecture** (Astro) — hydrate only the interactive widgets, ship zero JS for the rest.
- **Streaming SSR / React Server Components** — send HTML in chunks, keep some components server-only.

### Pros / Cons

| Pros | Cons |
|---|---|
| Fast first paint **and** app-like feel after | Most complex of the six: code runs in two places |
| SEO-friendly real HTML | Server and client must render identically (hydration mismatches) |
| Works (read-only) before/without JS | You ship the UI twice: as HTML and as JS |
| One codebase for server + client views | Needs a Node (or edge) runtime, not just static hosting |

**Use when:** public-facing sites that also need rich interactivity — e-commerce,
news, marketing + product apps.

### Demo

A Next.js (App Router) app. [app/page.tsx](03-ssr-hybrid/app/page.tsx) is a **Server
Component** — it runs only on the server and its output arrives as HTML (view
source: the initial count is already there). [app/Counter.tsx](03-ssr-hybrid/app/Counter.tsx)
is a **Client Component** (`"use client"`): server-rendered for the first paint,
then hydrated — the page tells you the moment the button comes alive.

```sh
npm install
npm run dev            # or: npm run build && npm start
# open http://localhost:3003
```

---

## 04 — Micro-Frontends

An **organizational** architecture more than a technical one: split the frontend
into pieces owned end-to-end by independent teams, each **built and deployed
separately**, then composed into one page at runtime. It applies the microservices
idea to the UI.

Real-world tools: Webpack Module Federation, single-spa, importmaps, iframes.
Used by Amazon, Zalando, Spotify, IKEA at scale.

```
        ┌────────────── Shell / container app (host) ───────────────┐
        │  <ProductsWidget/>  ◀── remoteEntry.js from Team A (:3041)
        │  <CartWidget/>      ◀── remoteEntry.js from Team B (:3042)
        └────────────────────────────────────────────────────────────┘
```

### Traits

- **Composition:** a thin shell decides *where* each micro-frontend mounts;
  each team decides *what* renders there and ships on their own schedule.
- **Independence:** teams can use different frameworks/versions (at a cost).
- **Communication:** kept minimal — URL, custom events, or a tiny shared bus.

### Pros / Cons

| Pros | Cons |
|---|---|
| Independent deploys — no release trains | Runtime composition complexity |
| Team autonomy over stack and pace | Duplicated dependencies bloat the page |
| Failure isolation (one widget ≠ whole page) | Consistent UX/design needs governance |
| Incremental rewrites of legacy apps | Cross-team state sharing is awkward |

**Use when:** many teams on one product surface, or strangling a legacy frontend.
**Avoid when:** one team — the overhead buys you nothing.

### Demo

Three separate npm projects wired with **Module Federation** (`@module-federation/vite`):

- [shell/](04-micro-frontends/shell/) — the host (port 3004). Owns layout and two mount points; it
  has **no copy** of the widgets' code and loads them over the network at runtime.
- [remote-products/](04-micro-frontends/remote-products/) — Team A (port 3041). Exposes
  `./ProductsWidget` via its `remoteEntry.js`.
- [remote-cart/](04-micro-frontends/remote-cart/) — Team B (port 3042). Exposes `./CartWidget`.

React is declared `shared: { singleton: true }` so it loads once, not three
times. The widgets communicate **only via DOM CustomEvents** — click "Add to
cart" in Team A's widget and watch Team B's cart react, with zero imports
between them. Each remote also runs standalone (open :3041 or :3042 directly) —
that's how the owning team develops in isolation.

```sh
# install once, in each of the three projects
(cd remote-products && npm install)
(cd remote-cart && npm install)
(cd shell && npm install)

# run all three (separate terminals), remotes first
cd remote-products && npm run dev     # :3041
cd remote-cart && npm run dev         # :3042
cd shell && npm run dev               # :3004  ← open this one
```

---

## 05 — JAMstack / Static-first

**J**avaScript, **A**PIs, **M**arkup: pre-render the HTML at **build time**,
deploy it as plain files to a CDN, and get anything dynamic from APIs at runtime
in the browser. There is no application server at request time — the "backend"
is a build step plus whatever APIs you call (serverless functions, headless CMS,
Stripe, Algolia…).

Classic tools: Next.js static export (this demo), Astro, Gatsby, Eleventy, Hugo,
deployed on Netlify / Vercel / GitHub Pages / any CDN.

```
BUILD TIME:  content + code ──next build──▶ out/ (plain HTML/CSS/JS files)
DEPLOY:      out/ ──▶ CDN
REQUEST:     Browser ◀── static file (fast, cacheable, nothing to crash)
RUNTIME:     Browser JS ──fetch──▶ APIs (the dynamic bits)
```

### Pros / Cons

| Pros | Cons |
|---|---|
| Fastest possible delivery (files off a CDN) | Content changes require a rebuild + redeploy |
| Nearly nothing to operate or scale | Build times grow with site size |
| Great security posture (no live server) | Truly per-user/per-request pages don't fit |
| Cheap hosting | Dynamic features depend on third-party APIs |

**Use when:** content sites, docs, blogs, marketing, catalogs that change on
deploy cadence — not per second.

### Demo

A Next.js app with `output: "export"` ([next.config.ts](05-jamstack/next.config.ts)):
`npm run build` emits plain static files into `out/`, served here by a dumb
static file server. The page body — including its build timestamp — is frozen
at build time ([app/page.tsx](05-jamstack/app/page.tsx)); reloading never changes it. The
quote at the bottom is the "A" in JAM: fetched from an API endpoint by the
browser at runtime ([app/QuoteWidget.tsx](05-jamstack/app/QuoteWidget.tsx)), so it changes
on every reload while the markup around it stays static.

```sh
npm install
npm run build          # pre-renders the site into out/
npm start              # serves out/ at http://localhost:3005
```

To see the "content requires a redeploy" property: edit the posts list in
[app/page.tsx](05-jamstack/app/page.tsx), reload (nothing changes), then rebuild (it does).

---

## 06 — Progressive Web App (PWA)

Not a rendering strategy but a **delivery layer** you add on top of any of the
other architectures. Two ingredients turn a web app into a PWA:

1. **Web app manifest** — name, icons, colors → the app becomes *installable*
   (address-bar install icon, home-screen icon, its own window).
2. **Service worker** — a programmable network proxy that caches the app shell
   → the app *loads offline* and instantly on repeat visits.

```
Browser ──request──▶ Service Worker ──cache hit──▶ instant response (even offline)
                          └──cache miss──▶ network ──▶ cache & respond
```

### Pros / Cons

| Pros | Cons |
|---|---|
| Works offline / on flaky networks | Service worker lifecycle is tricky (stale caches) |
| Installable — app-like without app stores | Full capability mostly on Chromium; iOS lags |
| Instant repeat loads from cache | Update flow needs care ("new version available") |
| One codebase for web + "app" | HTTPS required (localhost exempt) |

**Use when:** users return often or have unreliable networks — mail, chat,
news, field tools. It's a cheap add-on to any existing architecture.

### Demo

A Vite + React app wrapped by `vite-plugin-pwa` ([vite.config.ts](06-pwa/vite.config.ts)),
which generates the manifest and a Workbox service worker that precaches the
build. [src/main.tsx](06-pwa/src/main.tsx) registers the worker; the page shows its
status and walks you through the offline test.

```sh
npm install
npm run build          # the service worker is generated at build time
npm run preview        # http://localhost:3006
```

Then in the browser: DevTools → Application → Service Workers (see it active),
switch Network to **Offline**, reload — the app still loads. In Chrome/Edge,
note the install icon in the address bar.

# 04 — Micro-Frontends

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

## Traits

- **Composition:** a thin shell decides *where* each micro-frontend mounts;
  each team decides *what* renders there and ships on their own schedule.
- **Independence:** teams can use different frameworks/versions (at a cost).
- **Communication:** kept minimal — URL, custom events, or a tiny shared bus.

## Pros / Cons

| Pros | Cons |
|---|---|
| Independent deploys — no release trains | Runtime composition complexity |
| Team autonomy over stack and pace | Duplicated dependencies bloat the page |
| Failure isolation (one widget ≠ whole page) | Consistent UX/design needs governance |
| Incremental rewrites of legacy apps | Cross-team state sharing is awkward |

**Use when:** many teams on one product surface, or strangling a legacy frontend.
**Avoid when:** one team — the overhead buys you nothing.

## Demo

Four separate npm projects: three wired with **Module Federation** (client-side composition), one server-rendered fragment (see [SSR remote](#ssr-remote-server-side-composition)) (`@module-federation/vite`):

- [shell/](shell/) — the host (port 3004). Owns layout and two mount points; it
  has **no copy** of the widgets' code and loads them over the network at runtime.
- [remote-products/](remote-products/) — Team A (port 3041). Exposes
  `./ProductsWidget` via its `remoteEntry.js`.
- [remote-cart/](remote-cart/) — Team B (port 3042). Exposes `./CartWidget`.
- [remote-reviews/](remote-reviews/) — Team C (port 3043). A **server-rendered**
  reviews fragment: its own SSR service, not a federated module.

React is declared `shared: { singleton: true }` so it loads once, not three
times. The widgets communicate **only via DOM CustomEvents** — click "Add to
cart" in Team A's widget and watch Team B's cart react, with zero imports
between them. Each remote also runs standalone (open :3041 or :3042 directly) —
that's how the owning team develops in isolation.

```sh
# install once, in each project
(cd remote-products && npm install)
(cd remote-cart && npm install)
(cd remote-reviews && npm install)
(cd shell && npm install)

# run all four (separate terminals), remotes first
cd remote-products && npm run dev     # :3041
cd remote-cart && npm run dev         # :3042
cd remote-reviews && npm run dev      # :3043  (SSR service)
cd shell && npm run dev               # :3004  ← open this one
```

## Dev vs. prod config

The remote URLs in [shell/vite.config.ts](shell/vite.config.ts) come from
`VITE_PRODUCTS_REMOTE_URL` / `VITE_CART_REMOTE_URL`, falling back to the
localhost ports above when unset. In prod, build the shell with a
`.env.production` (see `.env.production.example`) pointing at each team's
real deployed `remoteEntry.js`. Two things to note:

- Vite inlines env vars at **build time**, so the shell needs a rebuild
  (not just a redeploy) whenever a remote's URL changes. Fully independent
  deploys — where the shell picks up a new remote URL without rebuilding —
  need a runtime manifest/config fetch instead of build-time env vars.
- The remotes' `server`/`preview` blocks (with `cors: true`) are Vite's dev
  and local-preview servers only. In prod, each remote is a static build
  served from a CDN/host, where CORS is configured at that layer — scoped to
  the shell's actual origin, not left wide open.

For how remotes are versioned, released and **rolled back** in production, see
[REMOTES.md](REMOTES.md).

## SSR remote (server-side composition)

Module Federation composes in the **browser**, so the first paint has no
remote content — each widget appears after its JS loads. [remote-reviews/](remote-reviews/)
shows the other model, **fragment composition**: the remote is its own Node SSR
service, and the host stitches its HTML in on the server.

```
browser ──GET /──▶ shell server.mjs ──GET :3043/fragment──▶ reviews SSR service
                        │                                        │ renders <Reviews/> with
                        │◀── HTML fragment + inlined state ──────┘ renderToString
                        └── index.html with <!--mfe:reviews--> replaced → response
browser: paints reviews immediately → loads reviews' script → hydrateRoot (island)
```

- **Two artifacts per remote** — `npm run build` in remote-reviews emits a
  browser bundle (`dist/client`, hashed, found via Vite's manifest) and a server
  bundle (`dist/server`).
- **Server owns the include.** [shell/server.mjs](shell/server.mjs) fetches the
  fragment per request and swaps it into the `<!--mfe:reviews-->` slot in
  [shell/index.html](shell/index.html). `curl localhost:3004` shows the reviews
  in the raw HTML — no JS needed for the first paint.
- **Hydrates as an island**, outside the shell's React tree, with its own React
  copy. State is inlined as `window.__MFE_STATE__.reviews` so the client
  hydrates instead of re-fetching (and `<` is escaped so it can't break out of
  the `<script>`). The widget shows "not hydrated yet" → "hydrated — buttons are
  live", and still reacts to the `add-to-cart` event like the other remotes.
- **Failure isolation on the server.** The shell caps the fragment fetch
  (`FRAGMENT_TIMEOUT_MS`, default 1500ms). Remote down, slow or erroring → a
  degraded box in that slot and the page still ships. Try it: stop :3043, or
  start it with `REVIEWS_DELAY_MS=3000`.
- **Trade-offs.** Stronger isolation than federated SSR (Team C's code runs in
  Team C's process; the shell only ingests an HTML string), but no shared
  component tree, a duplicated React on the page, and the shell now needs a
  server tier. The fragment is inserted verbatim — compose only services you
  own and pair it with a strict CSP.

`npm run dev` runs both servers with Vite in middleware mode. For prod-like:
`npm run build && npm run preview` in remote-reviews and in shell. Where the
shell finds the fragment is runtime config: `REVIEWS_FRAGMENT_URL` (shell) and
`REVIEWS_PUBLIC_URL` (remote — the origin the *browser* uses for its script).

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

Three separate npm projects wired with **Module Federation** (`@module-federation/vite`):

- [shell/](shell/) — the host (port 3004). Owns layout and two mount points; it
  has **no copy** of the widgets' code and loads them over the network at runtime.
- [remote-products/](remote-products/) — Team A (port 3041). Exposes
  `./ProductsWidget` via its `remoteEntry.js`.
- [remote-cart/](remote-cart/) — Team B (port 3042). Exposes `./CartWidget`.

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

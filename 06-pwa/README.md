# 06 — Progressive Web App (PWA)

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

## Pros / Cons

| Pros | Cons |
|---|---|
| Works offline / on flaky networks | Service worker lifecycle is tricky (stale caches) |
| Installable — app-like without app stores | Full capability mostly on Chromium; iOS lags |
| Instant repeat loads from cache | Update flow needs care ("new version available") |
| One codebase for web + "app" | HTTPS required (localhost exempt) |

**Use when:** users return often or have unreliable networks — mail, chat,
news, field tools. It's a cheap add-on to any existing architecture.

## Demo

A Vite + React app wrapped by `vite-plugin-pwa` ([vite.config.ts](vite.config.ts)),
which generates the manifest and a Workbox service worker that precaches the
build. [src/main.tsx](src/main.tsx) registers the worker; the page shows its
status and walks you through the offline test.

```sh
npm install
npm run build          # the service worker is generated at build time
npm run preview        # http://localhost:3006
```

Then in the browser: DevTools → Application → Service Workers (see it active),
switch Network to **Offline**, reload — the app still loads. In Chrome/Edge,
note the install icon in the address bar.

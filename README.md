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

<img width="972" height="854" alt="image" src="https://github.com/user-attachments/assets/56c40fe5-9850-4dfa-82c6-a21628933dac" />

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

## Architecture guides

The full guide for each architecture — the pattern, its trade-offs, and what to
look for in the demo — lives in that folder's README:

- [01 — Multi-Page App (MPA, server-rendered)](01-mpa/README.md)
- [02 — Single-Page App (SPA)](02-spa/README.md)
- [03 — SSR / Hybrid (server render + client hydration)](03-ssr-hybrid/README.md)
- [04 — Micro-Frontends](04-micro-frontends/README.md)
- [05 — JAMstack / Static-first](05-jamstack/README.md)
- [06 — Progressive Web App (PWA)](06-pwa/README.md)

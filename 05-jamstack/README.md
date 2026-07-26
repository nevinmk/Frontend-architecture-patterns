# 05 — JAMstack / Static-first

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

## Pros / Cons

| Pros | Cons |
|---|---|
| Fastest possible delivery (files off a CDN) | Content changes require a rebuild + redeploy |
| Nearly nothing to operate or scale | Build times grow with site size |
| Great security posture (no live server) | Truly per-user/per-request pages don't fit |
| Cheap hosting | Dynamic features depend on third-party APIs |

**Use when:** content sites, docs, blogs, marketing, catalogs that change on
deploy cadence — not per second.

## Demo

A Next.js app with `output: "export"` ([next.config.ts](next.config.ts)):
`npm run build` emits plain static files into `out/`, served here by a dumb
static file server. The page body — including its build timestamp — is frozen
at build time ([app/page.tsx](app/page.tsx)); reloading never changes it. The
quote at the bottom is the "A" in JAM: fetched from an API endpoint by the
browser at runtime ([app/QuoteWidget.tsx](app/QuoteWidget.tsx)), so it changes
on every reload while the markup around it stays static.

```sh
npm install
npm run build          # pre-renders the site into out/
npm start              # serves out/ at http://localhost:3005
```

To see the "content requires a redeploy" property: edit the posts list in
[app/page.tsx](app/page.tsx), reload (nothing changes), then rebuild (it does).

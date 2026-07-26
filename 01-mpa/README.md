# 01 — Multi-Page App (MPA, server-rendered)

The oldest and still most common architecture. **Every URL is a separate page, and
every navigation is a full page load.** The server receives the request, builds the
complete HTML (often from templates + database data), and sends it back. The browser
throws away the old page and renders the new one.

Classic examples: Rails, Django, Laravel/PHP, JSP — and this demo's plain Node server.

```
Browser ──GET /about──▶ Server (builds full HTML) ──▶ Browser renders new page
```

## Traits

- **Rendering:** server, on every request.
- **Routing:** the server's job (URL → handler → HTML).
- **State:** lives on the server (session, DB); the browser is mostly stateless.
- **JavaScript:** optional "sprinkles" for interactivity, not required for the app to work.

## Pros / Cons

| Pros | Cons |
|---|---|
| Simple mental model, one codebase | Full reload on every navigation (slower feel) |
| Great SEO by default | Hard to build app-like, highly interactive UIs |
| Works without JavaScript | Server does all rendering work per request |
| Fast first paint | UI state lost between pages unless persisted |

**Use when:** content sites, admin panels, forms-and-tables apps, anything where
per-page interactivity is modest.

## Demo

An Express server where **React is used purely as a server-side templating
engine**: each route renders a page component with `renderToStaticMarkup` and
returns a complete HTML document. No JavaScript is shipped to the browser at
all — watch the full page reload (and the server timestamp change) as you click
the nav links.

Key files: [src/server.tsx](src/server.tsx) (routes), [src/pages.tsx](src/pages.tsx)
(page components), [src/Layout.tsx](src/Layout.tsx) (shared shell).

```sh
npm install
npm run dev        # tsx watch — restarts on change
# open http://localhost:3001
```

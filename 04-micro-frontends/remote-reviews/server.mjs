import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Team C's own SSR service. It owns two routes:
//   GET /fragment  → an HTML fragment (markup + inlined state + hydrate script)
//                    for a host to stitch into its page
//   GET /          → the same fragment in a bare page, so Team C can develop alone
// Everything else is the browser bundle (Vite in dev, dist/client in prod).

const PORT = 3043;
const root = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.argv.includes("--prod");
// The origin the BROWSER uses to reach this service — baked into the fragment's
// script URL, so it must be public, not an internal hostname.
const PUBLIC_URL = process.env.REVIEWS_PUBLIC_URL ?? `http://localhost:${PORT}`;

const httpServer = createServer();
let vite;
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({
    root,
    appType: "custom",
    server: { middlewareMode: true },
  });
}

// Dev re-resolves per request (HMR); prod loads the built server bundle once.
async function loadServerEntry() {
  return vite
    ? vite.ssrLoadModule("/src/entry-server.tsx")
    : import(pathToFileURL(path.join(root, "dist/server/entry-server.js")).href);
}

async function clientScriptUrl() {
  if (vite) return `${PUBLIC_URL}/src/entry-client.tsx`;
  const manifest = JSON.parse(
    await readFile(path.join(root, "dist/client/.vite/manifest.json"), "utf8"),
  );
  const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
  return `${PUBLIC_URL}/${entry.file}`;
}

// State goes inside a <script>, so "<" must not be able to close it early.
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

async function renderFragment() {
  const { render } = await loadServerEntry();
  const { html, state } = await render();
  return `<section data-mfe="reviews" style="border:2px solid darkorange;padding:1rem">
<div id="reviews-root">${html}</div>
<script>window.__MFE_STATE__=Object.assign(window.__MFE_STATE__||{},{reviews:${safeJson(state)}})</script>
<script type="module" src="${await clientScriptUrl()}"></script>
</section>`;
}

const MIME = { ".js": "text/javascript", ".css": "text/css", ".map": "application/json" };

httpServer.on("request", async (req, res) => {
  const { pathname } = new URL(req.url, PUBLIC_URL);
  try {
    if (pathname === "/fragment" || pathname === "/") {
      const fragment = await renderFragment();
      const isPage = pathname === "/";
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        // Cache per fragment at the edge — kept off here so the
        // render timestamp visibly changes on reload.
        "cache-control": "no-store",
        "access-control-allow-origin": process.env.ALLOWED_ORIGIN ?? "http://localhost:3004",
      });
      res.end(
        isPage
          ? `<!doctype html><meta charset="utf-8"><title>Reviews remote (standalone)</title><h1>Reviews remote (standalone dev mode)</h1>${fragment}`
          : fragment,
      );
      return;
    }

    if (vite) {
      vite.middlewares(req, res, () => {
        res.writeHead(404).end("Not found");
      });
      return;
    }

    if (pathname.startsWith("/assets/")) {
      const file = path.join(root, "dist/client", pathname);
      if (file.startsWith(path.join(root, "dist/client", "assets"))) {
        const body = await readFile(file);
        res.writeHead(200, {
          "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
          "cache-control": "public, max-age=31536000, immutable", // hashed filenames
          "access-control-allow-origin": process.env.ALLOWED_ORIGIN ?? "http://localhost:3004",
        });
        res.end(body);
        return;
      }
    }
    res.writeHead(404).end("Not found");
  } catch (err) {
    if (vite && err instanceof Error) vite.ssrFixStacktrace(err);
    console.error("[reviews] request failed:", err);
    res.writeHead(500).end("Reviews fragment failed to render");
  }
});

httpServer.listen(PORT, () =>
  console.log(`[reviews] ${isProd ? "prod" : "dev"} SSR service on http://localhost:${PORT}`),
);

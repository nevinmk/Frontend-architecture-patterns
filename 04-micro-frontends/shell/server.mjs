import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// The shell's server tier. The client-side remotes (products, cart) still
// federate in the browser; this exists for the ONE thing a static host can't
// do: server-side composition of SSR fragments (the fragment-composition model).
//
// On each page request it fetches Team C's fragment, drops it into the
// <!--mfe:reviews--> slot of index.html, and sends the assembled HTML — so the
// reviews are in the first byte of the response, before any JS runs. The
// fragment then hydrates as its own island; it is not part of the shell's
// React tree.
//   npm run dev      → Vite in middleware mode (HMR, remotes via the dev graph)
//   npm run preview  → serves dist/ (run `npm run build` first)

const PORT = 3004;
const root = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.argv.includes("--prod");

const REVIEWS_FRAGMENT_URL =
  process.env.REVIEWS_FRAGMENT_URL ?? "http://localhost:3043/fragment";
// Per-remote server-side timeout: a slow fragment must not hold
// up the whole page's TTFB.
const FRAGMENT_TIMEOUT_MS = Number(process.env.FRAGMENT_TIMEOUT_MS ?? 1500);

// Failure isolation, server edition: a fragment that is down, slow, or
// erroring becomes a degraded box in its own slot; the page still ships.
const unavailable = (name) =>
  `<section data-mfe="${name}" role="alert" style="border:2px solid darkorange;padding:1rem;color:#a11">` +
  `<strong>${name}</strong> is unavailable. The rest of the page rendered without it.</section>`;

async function fetchFragment(name, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FRAGMENT_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Trust boundary: this HTML is inserted verbatim, so its author can run
    // script on the shell's origin. Only compose fragments from services you
    // own, and pair it with a strict CSP.
    return await res.text();
  } catch (err) {
    console.error(`[shell] fragment "${name}" failed:`, err instanceof Error ? err.message : err);
    return unavailable(name);
  }
}

// Function replacer: a string replacement would interpret "$&", "$'" etc. in the fragment.
const compose = async (template) => {
  const fragment = await fetchFragment("reviews", REVIEWS_FRAGMENT_URL);
  return template.replace("<!--mfe:reviews-->", () => fragment);
};

const httpServer = createServer();
let vite;
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({
    root,
    appType: "custom",
    // Middleware mode opens its own HMR socket unless handed the HTTP server.
    server: { middlewareMode: true, ws: { server: httpServer } },
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function serveStatic(pathname, res) {
  const dist = path.join(root, "dist");
  const file = path.join(dist, pathname);
  if (!file.startsWith(dist + path.sep)) return false; // no path traversal
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
    });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

httpServer.on("request", async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (pathname === "/" || pathname === "/index.html") {
      let template;
      if (vite) {
        template = await readFile(path.join(root, "index.html"), "utf8");
        template = await vite.transformIndexHtml(req.url, template);
      } else {
        template = await readFile(path.join(root, "dist/index.html"), "utf8");
      }
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store", // the page embeds per-request fragments
      });
      res.end(await compose(template));
      return;
    }

    if (vite) {
      vite.middlewares(req, res, () => res.writeHead(404).end("Not found"));
    } else if (!(await serveStatic(pathname, res))) {
      res.writeHead(404).end("Not found");
    }
  } catch (err) {
    if (vite && err instanceof Error) vite.ssrFixStacktrace(err);
    console.error("[shell] request failed:", err);
    res.writeHead(500).end("Shell failed to render");
  }
});

httpServer.listen(PORT, () =>
  console.log(`[shell] ${isProd ? "prod" : "dev"} server on http://localhost:${PORT}`),
);

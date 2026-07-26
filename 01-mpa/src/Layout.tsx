import type { ReactNode } from "react";

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{`${title} — MPA demo`}</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a> | <a href="/about">About</a> | <a href="/products">Products</a>
        </nav>
        <hr />
        {children}
        <p>
          <small>
            Rendered by the server at {new Date().toLocaleTimeString()} — the timestamp
            changes on every navigation because each click is a full page load.
          </small>
        </p>
      </body>
    </html>
  );
}

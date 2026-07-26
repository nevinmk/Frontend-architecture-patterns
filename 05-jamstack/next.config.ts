import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The JAMstack switch: `next build` emits plain static files into out/.
  // No Node server in production — any static host/CDN can serve the site.
  output: "export",
  // This app is its own workspace; don't infer a root from parent lockfiles.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;

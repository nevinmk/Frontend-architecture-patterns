import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This app is its own workspace; don't infer a root from parent lockfiles.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;

import { defineConfig } from "vite";

// No plugin-react on purpose: this remote's client script is loaded by ANOTHER
// team's page via a plain <script> tag, not through an index.html Vite controls,
// so there is no place to inject the Fast Refresh preamble. JSX uses the
// automatic runtime from tsconfig instead.
export default defineConfig({
  build: {
    target: "chrome89",
    outDir: "dist/client",
    // The server reads the manifest to find the hashed client bundle per
    // request — the shell never hard-codes a filename.
    manifest: true,
    rollupOptions: { input: "src/entry-client.tsx" },
  },
  // Vite's dev server only. In prod the assets sit on a CDN and CORS is set
  // there — scoped to the shell's origin, not "*".
  server: { cors: { origin: "http://localhost:3004" }, hmr: false },
});

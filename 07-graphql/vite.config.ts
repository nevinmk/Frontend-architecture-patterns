import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client talks to the GraphQL API on :3071 directly (Yoga sends permissive
// CORS headers) rather than through a dev proxy — keeping the two halves of the
// architecture visibly separate, exactly as they would be in production.
export default defineConfig({
  plugins: [react()],
  server: { port: 3007 },
  preview: { port: 3007 },
});

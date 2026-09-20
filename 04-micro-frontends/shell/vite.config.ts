import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// Remotes are not declared here. The shell fetches remotes.json at boot and
// registers them at runtime (src/remotes.ts), so a remote release or rollback
// is a manifest change and needs no shell rebuild.
export default defineConfig({
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {},
        // Load React once, not once per micro-frontend.
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
        },
      }),
    ],
    server: { port: 3004 },
    preview: { port: 3004 },
    build: { target: "chrome89" },
});

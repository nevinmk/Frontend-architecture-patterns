import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "products",
      filename: "remoteEntry.js",
      // The public contract: what this team ships for others to consume.
      exposes: {
        "./ProductsWidget": "./src/ProductsWidget.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  // server/preview are Vite's dev & local-preview servers only — in prod this
  // is a static build served from a CDN/host, where CORS is set at that layer
  // (allow the shell's origin specifically, not cors: true / "*").
  server: { port: 3041, cors: true },
  preview: { port: 3041, cors: true },
  build: { target: "chrome89" },
});

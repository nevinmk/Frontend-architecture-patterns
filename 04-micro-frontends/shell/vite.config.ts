import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      // Each remote is fetched at RUNTIME from wherever that team deployed it.
      remotes: {
        products: {
          type: "module",
          name: "products",
          entry: "http://localhost:3041/remoteEntry.js",
        },
        cart: {
          type: "module",
          name: "cart",
          entry: "http://localhost:3042/remoteEntry.js",
        },
      },
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

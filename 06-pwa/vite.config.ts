import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // The PWA layer: generates the web app manifest and a Workbox service
    // worker that precaches the build output for offline use.
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PWA demo",
        short_name: "PWA",
        description: "Progressive Web App architecture demo",
        theme_color: "#1a73e8",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  server: { port: 3006 },
  preview: { port: 3006 },
});

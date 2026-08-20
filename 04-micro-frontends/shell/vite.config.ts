import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// Remote URLs are baked in at build time (Vite inlines env vars into the
// bundle), so each deploy environment needs its own build driven by its own
// env vars — see .env.production.example. That's the tradeoff of this
// approach vs. a runtime manifest fetch: simpler, but the shell must be
// rebuilt (not just redeployed) whenever a remote's URL changes.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  const productsRemote =
    env.VITE_PRODUCTS_REMOTE_URL ?? "http://localhost:3041/remoteEntry.js";
  const cartRemote =
    env.VITE_CART_REMOTE_URL ?? "http://localhost:3042/remoteEntry.js";

  return {
    plugins: [
      react(),
      federation({
        name: "shell",
        // Each remote is fetched at RUNTIME from wherever that team deployed it.
        remotes: {
          products: { type: "module", name: "products", entry: productsRemote },
          cart: { type: "module", name: "cart", entry: cartRemote },
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
  };
});

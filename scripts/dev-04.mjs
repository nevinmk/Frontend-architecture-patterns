import concurrently from "concurrently";
import { PORTS } from "./constants/ports.mjs";
import { freePorts } from "./free-ports.mjs";

// Runs only the micro-frontends demo: the shell (3004) and its three remotes.
// Same cleanup approach as dev.mjs — the processes holding the ports sit below
// npm and vite, so on Windows they can outlive Ctrl+C. Sweep by port instead.

const PORTS_04 = [
  PORTS.shell,
  PORTS.remoteProducts,
  PORTS.remoteCart,
  PORTS.remoteReviews,
];

const APPS = [
  { name: "products", dir: "remote-products", prefixColor: "magenta" },
  { name: "cart", dir: "remote-cart", prefixColor: "magenta" },
  { name: "reviews", dir: "remote-reviews", prefixColor: "magenta" },
  { name: "shell", dir: "shell", prefixColor: "cyan" },
];

console.log("Releasing any ports left over from a previous run:");
freePorts(PORTS_04);

const { result } = concurrently(
  APPS.map(({ name, dir, prefixColor }) => ({
    name,
    prefixColor,
    command: `npm run dev --prefix 04-micro-frontends/${dir}`,
  })),
  { killOthersOn: ["failure", "success"] },
);

console.log(`\nMicro-frontends → http://localhost:${PORTS.shell}\n`);

// Ctrl+C makes concurrently reject; that's a normal way out, not an error.
result.catch(() => {}).finally(() => {
  console.log("\nShutting down — releasing micro-frontend ports:");
  freePorts(PORTS_04);
  process.exit(0);
});

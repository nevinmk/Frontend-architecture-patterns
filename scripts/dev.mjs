import { spawn } from "node:child_process";
import { ALL_PORTS } from "./constants/ports.mjs";
import { freePorts } from "./free-ports.mjs";

// Wraps the dev stack so Ctrl+C actually ends it.
//
// `concurrently --kill-others` handles its own children well enough, but the
// processes that hold the ports are two levels below it (npm → tsx/vite → the
// server). On Windows those routinely outlive the Ctrl+C that stopped their
// parent. So rather than trust the signal to cascade, this sweeps the ports
// once the stack has exited — by PID, from the socket, which is the only view
// that cannot be fooled by a broken process tree.

// On the way in: clear anything a previous session leaked. This must happen
// before the stack starts, or it would kill the servers it just launched.
console.log("Releasing any ports left over from a previous run:");
freePorts(ALL_PORTS);

const child = spawn("npm", ["run", "dev:all"], { stdio: "inherit", shell: true });

let sweeping = false;

function sweep(reason) {
  if (sweeping) return;
  sweeping = true;
  console.log(`\nShutting down (${reason}) — releasing dev ports:`);
  freePorts(ALL_PORTS);
}

// Ctrl+C: ask the stack to stop and let the exit handler sweep. A second
// Ctrl+C gives up waiting and sweeps immediately.
process.on("SIGINT", () => {
  if (sweeping) {
    process.exit(130);
  }
  child.kill("SIGINT");
});

process.on("SIGTERM", () => child.kill("SIGTERM"));

child.on("exit", (code) => {
  sweep("dev stack exited");
  process.exit(code ?? 0);
});

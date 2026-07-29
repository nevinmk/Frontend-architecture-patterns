import { execFileSync } from "node:child_process";
import { ALL_PORTS } from "./constants/ports.mjs";

// Frees any port this repo uses that is still held by a listener.
//
// The problem it solves is specific to how the dev servers nest. `npm run dev`
// spawns concurrently, which spawns npm, which spawns tsx/vite, which spawns
// the process that actually binds the port. Ctrl+C signals the foreground
// process; on Windows the grandchildren frequently survive it, keeping the
// socket open with no terminal attached to them. The next `npm run dev` then
// fails with EADDRINUSE against a process the user cannot see.
//
// Usage:
//   node scripts/free-ports.mjs            every port in constants/ports.mjs
//   node scripts/free-ports.mjs 3007 3071  just those

const isWindows = process.platform === "win32";

/** PIDs listening on a port. Empty when the port is free. */
function listenersOn(port) {
  try {
    const output = isWindows
      ? execFileSync(
          "powershell",
          [
            "-NoProfile",
            "-Command",
            `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess`,
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
        )
      : execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        });

    return [...new Set(output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
  } catch {
    // Both tools exit non-zero when nothing matches, which is the common case.
    return [];
  }
}

function killTree(pid) {
  try {
    if (isWindows) {
      // /T takes the children with it — the whole point, since the process
      // holding the socket is usually a grandchild of whatever was Ctrl+C'd.
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(Number(pid), "SIGKILL");
    }
    return true;
  } catch {
    return false;
  }
}

/** Returns the number of ports it had to free. */
export function freePorts(ports = ALL_PORTS, { quiet = false } = {}) {
  let freed = 0;

  for (const port of ports) {
    for (const pid of listenersOn(port)) {
      // Never take out the process doing the cleaning.
      if (Number(pid) === process.pid) continue;
      if (killTree(pid)) {
        freed += 1;
        if (!quiet) console.log(`  freed :${port} (pid ${pid})`);
      } else if (!quiet) {
        console.log(`  could not free :${port} (pid ${pid}) — may belong to another user`);
      }
    }
  }

  if (!quiet && freed === 0) console.log("  all ports already free");
  return freed;
}

// Run directly (`node scripts/free-ports.mjs`) rather than imported.
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/") || process.argv[1]?.endsWith("free-ports.mjs")) {
  const requested = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n) && n > 0);
  console.log("Releasing dev ports:");
  freePorts(requested.length > 0 ? requested : ALL_PORTS);
}

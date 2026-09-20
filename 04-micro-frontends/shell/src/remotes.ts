import { loadRemote, registerRemotes } from "@module-federation/runtime";
// The same file the shell serves at /remotes.json, also bundled at build time
// as the last resort when the fetch fails and nothing is stored yet.
import bundled from "../public/remotes.json";

export type RemoteEntry = { name: string; entry: string; version?: string };
type Manifest = { remotes: RemoteEntry[] };

// One manifest per environment: point this at that environment's manifest URL.
const MANIFEST_URL: string = import.meta.env.VITE_REMOTES_MANIFEST_URL ?? "/remotes.json";
const LAST_GOOD_KEY = "mfe:remotes:last-good";

const isManifest = (value: unknown): value is Manifest =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as Manifest).remotes) &&
  (value as Manifest).remotes.every(
    (r) => typeof r?.name === "string" && typeof r?.entry === "string",
  );

async function fetchManifest(): Promise<Manifest> {
  // no-cache: revalidate every load, so a release or rollback shows up at once.
  const res = await fetch(MANIFEST_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body: unknown = await res.json();
  if (!isManifest(body)) throw new Error("malformed manifest");
  return body;
}

function readLastGood(): Manifest | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(LAST_GOOD_KEY) ?? "null");
    return isManifest(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeLastGood(manifest: Manifest) {
  try {
    localStorage.setItem(LAST_GOOD_KEY, JSON.stringify(manifest));
  } catch {
    // storage unavailable (private mode, quota): the bundled copy still covers us
  }
}

// Fetch the manifest and register the remotes it lists. A bad manifest falls
// back to the last-known-good copy, then to the bundled one, never to nothing.
export async function bootRemotes(): Promise<void> {
  let manifest: Manifest;
  let source: string;
  try {
    manifest = await fetchManifest();
    source = MANIFEST_URL;
    writeLastGood(manifest);
  } catch (err) {
    console.error(
      `[shell] manifest ${MANIFEST_URL} unusable:`,
      err instanceof Error ? err.message : err,
    );
    const lastGood = readLastGood();
    manifest = lastGood ?? bundled;
    source = lastGood ? "last-known-good" : "bundled";
  }

  registerRemotes(manifest.remotes.map((r) => ({ name: r.name, entry: r.entry, type: "module" })));
  console.info(
    `[shell] composed from ${source}:`,
    manifest.remotes.map((r) => `${r.name}@${r.version ?? "unversioned"}`).join(", "),
  );
}

// Stand-in for `import("products/ProductsWidget")`, which only works for
// remotes known at build time.
export async function loadWidget(id: string): Promise<{ default: React.ComponentType }> {
  const mod = await loadRemote<{ default: React.ComponentType }>(id);
  if (!mod) throw new Error(`remote module "${id}" not found`);
  return mod;
}

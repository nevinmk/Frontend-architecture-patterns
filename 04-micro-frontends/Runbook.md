# Maintaining, updating and rolling back remotes

How remotes are owned, released and reverted in production. Companion to the
[README](README.md).

> **Status of this repo.** What is implemented today is the *build-time* model
> ([§2A](#2a-build-time-env-vars-current)): remote URLs come from `VITE_*_REMOTE_URL` and are inlined into the
> shell bundle. The *runtime manifest* model ([§2B](#2b-runtime-manifest-recommended-for-prod)) is the recommended production
> setup and is described here as the target design; the shell does not fetch a
> manifest yet. Where the two differ for rollback, both are covered ([§5](#5-rollback-strategy)).

## 1. Who owns what

| Artifact | Owner | Lives at |
|---|---|---|
| Remote code (`products`, `cart`) | the remote's team | that team's repo |
| Remote build output (`remoteEntry.js` + chunks) | the remote's pipeline | CDN/object store, **immutable, versioned paths** |
| Remote *pointer* (which build is live) | the remote's pipeline (or a release team, see [§3](#3-release-flow-for-a-remote)) | env vars ([§2A](#2a-build-time-env-vars-current)) or `remotes.json` ([§2B](#2b-runtime-manifest-recommended-for-prod)) |
| Shell code and layout | platform / shell team | shell repo |
| SSR fragment remote (`reviews`) | its team | own service; shell reads `REVIEWS_FRAGMENT_URL` |

Nobody edits production by hand. A person may *approve* a change; a pipeline
applies it.

## 2. How a remote's URL reaches the shell

### 2A. Build-time env vars (current)

The shell is built with `VITE_PRODUCTS_REMOTE_URL` / `VITE_CART_REMOTE_URL`
(see [shell/.env.production.example](shell/.env.production.example)). Vite
inlines them into the bundle.

- Changing a remote's URL means **rebuilding and redeploying the shell**.
- Fine when remote URLs are stable (e.g. always `.../current/remoteEntry.js`
  and the remote team overwrites what `current` points to).
- The coupling: every remote release that changes a URL needs the shell
  pipeline. That is the thing micro-frontends are meant to avoid.

### 2B. Runtime manifest (recommended for prod)

The shell fetches a small JSON at boot and registers remotes from it, so URLs
are not in the bundle. A release becomes "publish a new manifest", and the
shell is untouched.

```json
{
  "remotes": [
    { "name": "products", "entry": "https://cdn.example.com/products/1.14.2/remoteEntry.js", "version": "1.14.2" },
    { "name": "cart",     "entry": "https://cdn.example.com/cart/3.2.0/remoteEntry.js",     "version": "3.2.0" }
  ]
}
```

- `entry` points at an **immutable, versioned** path. `version` is metadata
  for the boot log and for debugging which builds were composed.
- Serve the manifest with `Cache-Control: no-cache` (or a short TTL, ~30-60s).
  A long TTL delays both releases and rollbacks.
- One manifest per environment (dev / staging / prod). Never share one.
- Shell behaviour on a bad manifest: fall back to the last-known-good copy
  (bundled at shell build time or kept in `localStorage`) rather than
  rendering nothing.

## 3. Release flow for a remote

```
remote repo: merge ─▶ CI: test + build
   ─▶ upload to  cdn/<remote>/<version>/   (new immutable path, never overwrite)
   ─▶ smoke test that build in isolation and against the current shell (staging)
   ─▶ promote: update this remote's entry in the prod manifest
   ─▶ watch error rate / web-vitals for that remote (canary window)
   ─▶ done, or roll back ([§5](#5-rollback-strategy))
```

Rules that make this safe:

1. **Never overwrite a published version.** Old builds must stay reachable, or
   rollback and long-lived browser tabs both break.
2. **Hashed filenames for chunks**, so a new release never serves stale chunks
   under an old name.
3. **Update only your own entry.** Per-remote manifest files (or a
   compare-and-swap write) stop two teams' deploys from overwriting each other.
4. **Promotion is separate from upload.** Uploading a build is harmless;
   changing the pointer is the release. That gap is what makes rollback cheap.
5. **Gated remotes.** For a critical surface (checkout), have the pipeline
   open a PR against the manifest repo that a release owner approves instead of
   applying directly.

## 4. Compatibility contracts (what can break the page)

A remote and the shell (and other remotes) are deployed independently, so the
contract between them must be stable or versioned.

| Contract | Rule |
|---|---|
| Exposed module names (`./ProductsWidget`) | Adding is safe. Renaming/removing is breaking: keep the old name for at least one release cycle. |
| Component props | Additive and optional only. Breaking change means a new exposed name (`./ProductsWidgetV2`). |
| Shared singletons (`react`, `react-dom`) | Keep the `requiredVersion` range compatible across all remotes. A major React bump is a coordinated release, not an independent one. |
| DOM events (`add-to-cart`) | Treat the event name and `detail` shape as a public API. Add fields; do not change or remove them. |
| Shell mount points | Remote must render sensibly with no props and inside an error boundary. |

Breaking changes use **expand / contract**: ship the new contract alongside the
old, migrate consumers, then remove the old one in a later release. That keeps
every deploy independently rollback-able.

## 5. Rollback strategy

Goal: get users back on a known-good state in **minutes, without a rebuild**,
and without other teams' remotes being affected.

### 5.1 Layers of defence (fastest first)

1. **Kill switch / feature flag (seconds).** Ship risky remote changes behind a
   flag. Turning it off hides the new behaviour without any deploy.
2. **Client-side failure isolation (automatic).** Each remote mounts inside an
   error boundary with a load timeout and a fallback UI. A remote that fails to
   load or throws renders a degraded box; the rest of the page keeps working.
   For the SSR fragment, the shell already caps the fetch (`FRAGMENT_TIMEOUT_MS`)
   and ships the page with a degraded slot. This limits *blast radius*; it is
   not a fix. In simple terms: if reviews is slow or down, the shell waits at
   most `FRAGMENT_TIMEOUT_MS`, then shows a "reviews is unavailable" box and
   sends the rest of the page anyway.
3. **Repoint to the previous version (minutes) — the main rollback.** Because
   old builds are immutable and still on the CDN, rollback is changing a
   pointer:
   - *Manifest model ([§2B](#2b-runtime-manifest-recommended-for-prod)):* revert that remote's entry to the previous
     `entry`/`version` and republish the manifest. Only that remote changes;
     the shell and other remotes are untouched. Users pick it up on next page
     load (bounded by the manifest cache TTL).
   - *Env-var model ([§2A](#2a-build-time-env-vars-current)):* if the remote deploys to a stable `current` path,
     repoint `current` to the previous build on the CDN (alias/symlink/copy).
     If the URL is baked into the shell, you must rebuild and redeploy the
     shell with the old URL, which is why [§2A](#2a-build-time-env-vars-current) is the slower path.
4. **Redeploy previous artifact.** If the pointer model isn't available,
   re-run the remote's pipeline for the last good commit/tag. Slowest, and
   avoid relying on it.

### 5.2 Who can roll back

- The owning team can roll back **their own remote** at any time, without
  approval, using the runbook below.
- The platform team can roll back any remote, or the shell, during an incident.
- Rolling back a remote must never require touching another team's code.

### 5.3 Runbook: roll back one remote

1. Identify the bad release: check the boot log's `version` per remote, and
   the error dashboard filtered by remote name.
2. Find the previous good version (manifest git history, or the CDN's
   `<remote>/<version>/` listing).
3. Revert that remote's manifest entry to it (a `git revert` of the promote
   commit is ideal, since the manifest is in version control) and publish.
4. Purge the manifest from the CDN cache if it was cached with a TTL longer
   than your tolerance.
5. Verify: hard-reload the shell, confirm the composed `version` in the boot
   log, watch the error rate return to baseline.
6. Leave the bad build on the CDN (do not delete it) for the post-mortem, and
   fix forward under a new version number.

### 5.4 Rolling back the shell

The shell is versioned and deployed like any other artifact. Keep the previous
N shell builds available and switch traffic back at the hosting/CDN layer. Since
remotes are independent, a shell rollback does not need remote rollbacks
unless the shell/remote contract ([§4](#4-compatibility-contracts-what-can-break-the-page)) was broken, which expand/contract is
meant to prevent.

### 5.5 Gotchas

- **Long-lived tabs** still have the old remote loaded; they only get the
  rollback on reload. This is why old versions must stay on the CDN: those
  tabs may lazy-load old chunks at any time.
- **Shared-dependency skew.** Rolling one remote back can leave it on a
  `react` range that no longer matches the others. Check `requiredVersion`
  before rolling back across a dependency bump.
- **Data/schema changes.** A code rollback does not undo backend or storage
  migrations. Keep migrations backward compatible so the previous build still
  works against the current backend.
- **Cache poisoning.** If `remoteEntry.js` itself was served with a long
  cache lifetime, users can stay pinned to a bad entry after the pointer moves.
  Serve entry files with `no-cache` and only the hashed chunks as immutable
  (see [§5.6](#56-why-no-cache-for-entry-files-and-not-no-store) for what `no-cache` does and why not `no-store`).
- **SSR fragment remote (`reviews`).** Rollback is a service redeploy of the
  previous image/version, plus `REVIEWS_PUBLIC_URL` pointing at a build whose
  browser bundle matches the server bundle it renders.

### 5.6 Why `no-cache` for entry files (and not `no-store`)

The name is misleading: `no-cache` does **not** mean "don't cache". The browser
still keeps a copy of `remoteEntry.js`. It just may not use that copy without
asking the server first.

On each load:

1. The browser asks: "I have a copy tagged `v123`. Is it still current?"
   (via the `ETag` / `Last-Modified` headers).
2. Unchanged: the server replies `304 Not Modified`, tiny and with no body, and
   the browser uses its stored copy.
3. Changed: the server sends the full new file and the browser replaces its copy.

So the file is cached but re-checked every time. That is why a rollback shows up
immediately: the check always happens, and the server answers with whatever the
pointer is now.

| Header | Copy stored? | Used without asking the server? |
|---|---|---|
| `max-age=31536000` | Yes | Yes, for a year. This is what causes cache poisoning ([§5.5](#55-gotchas)). |
| `no-cache` | Yes | No, it revalidates first. |
| `no-store` | No | Nothing is kept at all. |

**Why `no-cache` is the right choice here:**

- The entry file is the one URL that must always reflect the current pointer,
  so it cannot be trusted blindly for any length of time (`max-age`).
- It is small and changes rarely, so a `304` on almost every load costs
  almost nothing.
- `no-store` is stricter than needed. It would force a full download of
  `remoteEntry.js` on every load, when a `304` gives the same freshness for
  far less. Reserve `no-store` for responses that must never be kept on disk,
  such as sensitive or per-user data.

Hashed chunks are the opposite case: their names change with their content, so
they can safely use `max-age=31536000, immutable`.

## 6. Checklist for a remote team

- [ ] Publishes to a new immutable versioned path on every release
- [ ] Chunks are content-hashed; entry file is `no-cache`
- [ ] Updates only its own manifest entry (or opens a PR for it)
- [ ] Contract changes follow expand/contract ([§4](#4-compatibility-contracts-what-can-break-the-page))
- [ ] Risky changes are behind a flag
- [ ] Runs standalone and passes a smoke test against the staging shell before promotion
- [ ] Knows the rollback runbook ([§5.3](#53-runbook-roll-back-one-remote)) and has tried it in staging

## 7. Reference: semver ranges (`requiredVersion`)

`requiredVersion` on a shared dependency (see [§4](#4-compatibility-contracts-what-can-break-the-page)) uses the same semver range
syntax as `package.json`. A version is `MAJOR.MINOR.PATCH`, e.g. `18.2.1`.

| Range | Means | Matches | Doesn't match |
|---|---|---|---|
| `18.2.1` | Exactly this version | `18.2.1` | everything else |
| `^18.2.1` | Compatible with this: the leftmost non-zero part is locked | `>=18.2.1 <19.0.0`, so `18.2.5`, `18.9.0` | `19.0.0`, `18.2.0` |
| `~18.2.1` | Patch updates only | `>=18.2.1 <18.3.0`, so `18.2.9` | `18.3.0` |
| `>=18.2.0` | This version or anything higher | `18.2.0`, `19.4.0`, `25.0.0` | `18.1.9` |
| `>18.2.0`, `<19`, `<=18.5.0` | Ordinary comparisons | | |
| `18.x`, `18.*` | Any minor or patch in major 18 | `18.0.0`, `18.9.3` | `19.0.0` |
| `*` or `""` | Any version | everything | |
| `18.0.0 - 18.5.0` | Inclusive range | `18.0.0` to `18.5.0` | `18.5.1` |
| `^17 \|\| ^18` | Either range | `17.0.2`, `18.3.0` | `19.0.0` |

- `^` is the npm default. It allows new features and fixes but not breaking changes.
- `~` is stricter: bug fixes only.
- `^` on a `0.x` version is stricter than it looks: `^0.2.3` means
  `>=0.2.3 <0.3.0` and `^0.0.3` means exactly `0.0.3`.

**For Module Federation**

- `requiredVersion: "^18.2.0"` on `react` means "any React 18.x from 18.2.0 up".
  If another app loads React 19, the singleton check fails: a console warning
  by default, an error with `strictVersion: true`.
- For React and React DOM, `^18.2.0` is the usual choice. Use `~` only to pin
  tightly, and `>=` only if major bumps may land without a coordinated release.

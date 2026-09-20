// Shared by page.tsx (server render time) and Counter.tsx (hydration time)
// so the two timestamps are actually comparable down to the millisecond.
//
// Built manually rather than via toLocaleTimeString's fractionalSecondDigits:
// that option depends on the engine's bundled ICU data, and on a small-icu
// Node build (the default) it silently drops hh:mm:ss and prints only the
// milliseconds. This is deterministic regardless of ICU build or locale.
export function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

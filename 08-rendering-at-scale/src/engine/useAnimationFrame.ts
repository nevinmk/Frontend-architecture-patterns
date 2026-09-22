import { useEffect, useRef } from "react";

/**
 * Runs `callback` on every animation frame while `enabled`. `elapsedMs` is
 * measured from when this effect (re)started, which is what the benchmark
 * uses to time each phase against a single, uninterrupted clock.
 */
export function useAnimationFrame(
  callback: (dtSeconds: number, elapsedMs: number) => void,
  enabled: boolean,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const start = last;

    const tick = (now: number) => {
      // Clamp so a backgrounded tab / dev-tools pause doesn't fling
      // particles across the stage in one giant catch-up step.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      callbackRef.current(dt, now - start);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}

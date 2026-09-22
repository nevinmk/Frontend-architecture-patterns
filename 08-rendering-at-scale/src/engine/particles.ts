// Shared particle store + physics, independent of how it gets drawn. Typed
// arrays (not an array of objects) so 100k particles is one contiguous
// allocation each, and the render backends can read straight out of them
// with no per-frame allocation or GC pressure of their own.
export interface ParticleStore {
  count: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  radius: Float32Array;
  /** Packed [r, g, b] per particle, 0..1, length count * 3. */
  color: Float32Array;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

export function createParticles(count: number, width: number, height: number): ParticleStore {
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const vx = new Float32Array(count);
  const vy = new Float32Array(count);
  const radius = new Float32Array(count);
  const color = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    x[i] = Math.random() * width;
    y[i] = Math.random() * height;
    const speed = 25 + Math.random() * 70; // px / second
    const angle = Math.random() * Math.PI * 2;
    vx[i] = Math.cos(angle) * speed;
    vy[i] = Math.sin(angle) * speed;
    radius[i] = 1.5 + Math.random() * 2.5;
    const [r, g, b] = hslToRgb(Math.random(), 0.65, 0.55);
    color[i * 3] = r;
    color[i * 3 + 1] = g;
    color[i * 3 + 2] = b;
  }

  return { count, x, y, vx, vy, radius, color };
}

/** Advances positions in place and bounces particles off the stage edges. */
export function advance(p: ParticleStore, dtSeconds: number, width: number, height: number): void {
  const { count, x, y, vx, vy, radius } = p;
  for (let i = 0; i < count; i++) {
    const r = radius[i];
    let nx = x[i] + vx[i] * dtSeconds;
    let ny = y[i] + vy[i] * dtSeconds;

    if (nx < r) {
      nx = r;
      vx[i] = Math.abs(vx[i]);
    } else if (nx > width - r) {
      nx = width - r;
      vx[i] = -Math.abs(vx[i]);
    }
    if (ny < r) {
      ny = r;
      vy[i] = Math.abs(vy[i]);
    } else if (ny > height - r) {
      ny = height - r;
      vy[i] = -Math.abs(vy[i]);
    }

    x[i] = nx;
    y[i] = ny;
  }
}

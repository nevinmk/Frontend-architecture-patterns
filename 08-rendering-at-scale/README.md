# 08 — Rendering at Scale: SVG vs Canvas vs WebGL

Not an application architecture like 01–07 — a **rendering technique**
deep dive. Any of those seven can end up needing to draw thousands of moving
things (a chart, a map, a particle effect, a live data feed), and the
question "how do I draw it" has three real answers with very different
scaling curves. This demo runs the *same* particle simulation through all
three so the difference is visible instead of theoretical.

```
Physics (shared, technique-agnostic)
  Float32Array positions/velocities ──▶ advance(dt) each frame
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
                  SVG                     Canvas 2D                 WebGL
            retained-mode DOM        immediate-mode bitmap      GPU pipeline
         1 <circle> per particle   redraw whole bitmap/frame   1 draw call/frame
         cx/cy attrs + layout      arc() + fill() per particle  shader does the work
```

## The three techniques

| | SVG | Canvas 2D | WebGL |
|---|---|---|---|
| **Model** | Retained-mode: a real DOM node per shape | Immediate-mode: one bitmap, redrawn from scratch | GPU pipeline: vertex + fragment shaders |
| **Per-frame CPU cost** | `attribute set × count` + browser layout/paint over `count` nodes | `count` draw calls (state change + path + fill) | One buffer upload + **one** draw call |
| **Scaling with object count** | Roughly linear, and steep — DOM nodes are expensive | Roughly linear, but cheap per unit | Nearly flat — the GPU parallelizes the fill |
| **Best for** | Hundreds of shapes, or ones that need to be individually interactive/inspectable/stylable (CSS, DOM events, accessibility tree) | Thousands of shapes, custom 2D drawing, no per-object interactivity needed | Tens of thousands to millions of objects, particle/point effects, custom shaders |
| **Cost to build** | Lowest — declarative, just React-ish | Low — imperative but simple 2D API | Highest — shaders, buffers, manual matrix math |

**Use SVG when** the objects are few and need to behave like real DOM
elements (click handlers, CSS transitions, screen readers). **Use Canvas**
when you're drawing a lot but don't need per-object DOM — most charts, maps,
and games at moderate scale live here. **Reach for WebGL** only once Canvas
is visibly the bottleneck — the code is much more involved, but it's the
only one of the three whose frame cost barely moves as `count` climbs past
10k–100k.

## What's actually being compared

[src/engine/particles.ts](src/engine/particles.ts) holds `count` particles
in flat `Float32Array`s (position, velocity, radius, color) and steps them
with simple wall-bounce physics — identical regardless of which renderer is
active, so the only variable between runs is how the pixels get to the
screen. Each renderer implements one method, `draw(particles)`, called once
per animation frame from a single `requestAnimationFrame` loop in
[src/App.tsx](src/App.tsx):

- [SvgRenderer.tsx](src/renderers/SvgRenderer.tsx) — builds a pool of
  `<circle>` nodes once, then writes `cx`/`cy` directly via
  `setAttribute` every frame (bypassing React's reconciler — this is the
  fastest SVG can realistically be driven).
- [CanvasRenderer.tsx](src/renderers/CanvasRenderer.tsx) — clears the
  canvas and calls `arc()` + `fill()` per particle, the straightforward way
  most Canvas code is actually written.
- [WebglRenderer.tsx](src/renderers/WebglRenderer.tsx) — uploads particle
  positions into a buffer and renders them all as point sprites (`gl.POINTS`)
  in one `drawArrays` call; a fragment shader discards each sprite's
  corners so points render as circles.

## Demo

```sh
npm install
npm run dev          # http://localhost:3008
```

Pick an object count (1k–100k) and a renderer, and watch the live FPS/frame
time counter in the corner of the stage. Switch renderers at the same count
to feel the difference directly, or click **Run benchmark** to cycle through
all three automatically (3s measured per renderer, after a 0.5s warm-up) and
get an FPS comparison bar chart.

At 10k+ objects, expect roughly: SVG struggling to hold 60fps (and getting
markedly worse past ~20k), Canvas 2D holding up well into the tens of
thousands, and WebGL staying near-flat even at 100k. Exact numbers depend
heavily on your GPU and browser.

**Simplifications, on purpose:** no particle-particle collision (that's an
O(n²) physics cost, not a rendering one — it would muddy what's being
measured); no device-pixel-ratio scaling (fixed logical canvas size, for
simpler code); Canvas draws are not batched by color (bucketing fills would
speed it up further, but isn't how most Canvas code is written).

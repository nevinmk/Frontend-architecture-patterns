import { useCallback, useRef, useState } from "react";
import { advance, createParticles, type ParticleStore } from "./engine/particles";
import { useAnimationFrame } from "./engine/useAnimationFrame";
import { SvgRenderer } from "./renderers/SvgRenderer";
import { CanvasRenderer } from "./renderers/CanvasRenderer";
import { WebglRenderer } from "./renderers/WebglRenderer";
import { TECHNIQUES, type RendererHandle, type Technique } from "./renderers/types";
import { Controls } from "./components/Controls";
import { StatsOverlay } from "./components/StatsOverlay";
import { BenchmarkPanel } from "./components/BenchmarkPanel";

const STAGE_WIDTH = 900;
const STAGE_HEIGHT = 520;
const WARMUP_MS = 500;
const MEASURE_MS = 3000;

interface BenchmarkState {
  order: Technique[];
  phaseIndex: number;
  phaseStartMs: number;
  frames: number;
  results: Partial<Record<Technique, number>>;
}

export function App() {
  const [count, setCount] = useState(10_000);
  const [technique, setTechnique] = useState<Technique>("canvas");
  const [running, setRunning] = useState(true);
  const [displayStats, setDisplayStats] = useState({ fps: 0, frameTimeMs: 0 });
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<Partial<Record<Technique, number>>>({});

  // Lazy ref init: `useRef(createParticles(...))` would re-run the
  // (potentially 100k-particle) allocation on every render just to have
  // useRef discard it after the first — this null-check form only ever
  // allocates once.
  const particlesRef = useRef<ParticleStore | null>(null);
  if (particlesRef.current === null) {
    particlesRef.current = createParticles(count, STAGE_WIDTH, STAGE_HEIGHT);
  }
  const rendererRef = useRef<RendererHandle>(null);
  const benchmarkRef = useRef<BenchmarkState | null>(null);
  const fpsSmoothedRef = useRef(0);
  const lastStatsPushMs = useRef(0);

  const handleCountChange = useCallback((next: number) => {
    setCount(next);
    particlesRef.current = createParticles(next, STAGE_WIDTH, STAGE_HEIGHT);
  }, []);

  const handleRunBenchmark = useCallback(() => {
    benchmarkRef.current = {
      order: TECHNIQUES,
      phaseIndex: 0,
      phaseStartMs: -1, // set on first tick after the renderer swap lands
      frames: 0,
      results: {},
    };
    setBenchmarkResults({});
    setBenchmarking(true);
    setRunning(true);
    setTechnique(TECHNIQUES[0]);
  }, []);

  useAnimationFrame(
    (dtSeconds, elapsedMs) => {
      const particles = particlesRef.current!;
      advance(particles, dtSeconds, STAGE_WIDTH, STAGE_HEIGHT);
      rendererRef.current?.draw(particles);

      // Rolling FPS for the live overlay (exponential smoothing).
      const instantFps = dtSeconds > 0 ? 1 / dtSeconds : 0;
      fpsSmoothedRef.current =
        fpsSmoothedRef.current === 0 ? instantFps : fpsSmoothedRef.current * 0.9 + instantFps * 0.1;
      if (elapsedMs - lastStatsPushMs.current > 150) {
        lastStatsPushMs.current = elapsedMs;
        setDisplayStats({ fps: fpsSmoothedRef.current, frameTimeMs: dtSeconds * 1000 });
      }

      const bench = benchmarkRef.current;
      if (!bench) return;

      if (bench.phaseStartMs < 0) {
        bench.phaseStartMs = elapsedMs;
        bench.frames = 0;
        return;
      }

      const phaseElapsed = elapsedMs - bench.phaseStartMs;
      if (phaseElapsed < WARMUP_MS) return; // let JIT/GC/layout settle before counting

      const measuredElapsed = phaseElapsed - WARMUP_MS;
      bench.frames += 1;

      if (measuredElapsed >= MEASURE_MS) {
        const avgFps = bench.frames / (measuredElapsed / 1000);
        bench.results[bench.order[bench.phaseIndex]] = avgFps;
        bench.phaseIndex += 1;

        if (bench.phaseIndex >= bench.order.length) {
          setBenchmarkResults({ ...bench.results });
          setBenchmarking(false);
          benchmarkRef.current = null;
        } else {
          bench.phaseStartMs = -1;
          setTechnique(bench.order[bench.phaseIndex]);
        }
      }
    },
    running,
  );

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">Rendering at scale</p>
        <h1>SVG vs Canvas vs WebGL</h1>
        <p className="lede">
          The same {count.toLocaleString()}-particle simulation, drawn three different ways.
          Switch renderers live, or run the benchmark to compare average FPS at the current
          object count.
        </p>
      </header>

      <Controls
        count={count}
        onCountChange={handleCountChange}
        technique={technique}
        onTechniqueChange={setTechnique}
        running={running}
        onToggleRunning={() => setRunning((r) => !r)}
        benchmarking={benchmarking}
        onRunBenchmark={handleRunBenchmark}
      />

      <div className="stage-wrap">
        <StatsOverlay
          technique={technique}
          count={count}
          fps={displayStats.fps}
          frameTimeMs={displayStats.frameTimeMs}
        />
        {technique === "svg" && (
          <SvgRenderer key={`svg-${count}`} ref={rendererRef} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
        )}
        {technique === "canvas" && (
          <CanvasRenderer key={`canvas-${count}`} ref={rendererRef} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
        )}
        {technique === "webgl" && (
          <WebglRenderer key={`webgl-${count}`} ref={rendererRef} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
        )}
      </div>

      <BenchmarkPanel count={count} results={benchmarkResults} />
    </div>
  );
}

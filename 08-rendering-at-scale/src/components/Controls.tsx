import { TECHNIQUES, TECHNIQUE_LABEL, type Technique } from "../renderers/types";

const COUNT_OPTIONS = [1_000, 5_000, 10_000, 20_000, 50_000, 100_000];

interface ControlsProps {
  count: number;
  onCountChange: (count: number) => void;
  technique: Technique;
  onTechniqueChange: (technique: Technique) => void;
  running: boolean;
  onToggleRunning: () => void;
  benchmarking: boolean;
  onRunBenchmark: () => void;
}

export function Controls({
  count,
  onCountChange,
  technique,
  onTechniqueChange,
  running,
  onToggleRunning,
  benchmarking,
  onRunBenchmark,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="control-group">
        <span className="control-label">Objects</span>
        <select
          value={count}
          disabled={benchmarking}
          onChange={(e) => onCountChange(Number(e.target.value))}
        >
          {COUNT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <span className="control-label">Renderer</span>
        <div className="segmented">
          {TECHNIQUES.map((t) => (
            <button
              key={t}
              type="button"
              className={t === technique ? "active" : ""}
              disabled={benchmarking}
              onClick={() => onTechniqueChange(t)}
            >
              {TECHNIQUE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <button type="button" onClick={onToggleRunning} disabled={benchmarking}>
          {running ? "Pause" : "Resume"}
        </button>
        <button type="button" className="primary" onClick={onRunBenchmark} disabled={benchmarking}>
          {benchmarking ? "Benchmarking…" : "Run benchmark"}
        </button>
      </div>
    </div>
  );
}

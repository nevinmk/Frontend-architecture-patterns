import { TECHNIQUES, TECHNIQUE_LABEL, type Technique } from "../renderers/types";

interface BenchmarkPanelProps {
  count: number;
  results: Partial<Record<Technique, number>>;
}

export function BenchmarkPanel({ count, results }: BenchmarkPanelProps) {
  const measured = TECHNIQUES.filter((t) => results[t] !== undefined);
  if (measured.length === 0) return null;

  const maxFps = Math.max(...measured.map((t) => results[t]!));

  return (
    <div className="benchmark-panel">
      <h3>Average FPS at {count.toLocaleString()} objects</h3>
      <div className="benchmark-bars">
        {TECHNIQUES.map((t) => {
          const value = results[t];
          if (value === undefined) return null;
          const pct = Math.max(4, (value / maxFps) * 100);
          return (
            <div className="benchmark-row" key={t}>
              <span className="benchmark-label">{TECHNIQUE_LABEL[t]}</span>
              <div className="benchmark-track">
                <div className={`benchmark-fill ${t}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="benchmark-value">{value.toFixed(0)} fps</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

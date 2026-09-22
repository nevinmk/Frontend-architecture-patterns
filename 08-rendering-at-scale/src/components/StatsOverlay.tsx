import { TECHNIQUE_LABEL, type Technique } from "../renderers/types";

interface StatsOverlayProps {
  technique: Technique;
  count: number;
  fps: number;
  frameTimeMs: number;
}

export function StatsOverlay({ technique, count, fps, frameTimeMs }: StatsOverlayProps) {
  return (
    <div className="stats-overlay">
      <span className="stat">
        <strong>{TECHNIQUE_LABEL[technique]}</strong>
      </span>
      <span className="stat">{count.toLocaleString()} objects</span>
      <span className={`stat fps ${fps < 30 ? "bad" : fps < 50 ? "warn" : "good"}`}>
        {fps.toFixed(0)} fps
      </span>
      <span className="stat">{frameTimeMs.toFixed(1)} ms/frame</span>
    </div>
  );
}

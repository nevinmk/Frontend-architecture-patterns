import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ParticleStore } from "../engine/particles";
import type { RendererHandle, RendererProps } from "./types";

// Canvas 2D is immediate-mode: there's no per-object retained state, just one
// bitmap that gets cleared and redrawn every frame. No DOM nodes, so no
// layout — but this is the straightforward way to write it (a fillStyle
// change + beginPath/arc/fill per particle), and each fillStyle change is a
// state change the rasterizer has to honor. Bucketing particles by color to
// batch fills would go faster still; left as-is because it's what most
// Canvas code actually looks like, which is the point of the comparison.
export const CanvasRenderer = forwardRef<RendererHandle, RendererProps>(function CanvasRenderer(
  { width, height },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      draw(p: ParticleStore) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < p.count; i++) {
          const r = Math.round(p.color[i * 3] * 255);
          const g = Math.round(p.color[i * 3 + 1] * 255);
          const b = Math.round(p.color[i * 3 + 2] * 255);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(p.x[i], p.y[i], p.radius[i], 0, Math.PI * 2);
          ctx.fill();
        }
      },
    }),
    [],
  );

  return <canvas ref={canvasRef} width={width} height={height} className="stage-surface" />;
});

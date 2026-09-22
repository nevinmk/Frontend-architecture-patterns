import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ParticleStore } from "../engine/particles";
import type { RendererHandle, RendererProps } from "./types";

const SVG_NS = "http://www.w3.org/2000/svg";

// SVG is retained-mode: every particle is a real DOM node that the browser
// keeps around, restyles, and repaints. The fastest an app can drive it is
// to skip React's reconciler entirely and mutate attributes directly, which
// is what this does — cx/cy writes on a fixed pool of <circle> elements
// built once per mount. Even at its best case, that's still `count` DOM
// attribute writes plus a layout/paint pass over `count` retained nodes,
// every single frame.
export const SvgRenderer = forwardRef<RendererHandle, RendererProps>(function SvgRenderer(
  { width, height },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const circlesRef = useRef<SVGCircleElement[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      draw(p: ParticleStore) {
        const svg = svgRef.current;
        if (!svg) return;

        let circles = circlesRef.current;
        if (circles.length !== p.count) {
          svg.textContent = "";
          circles = new Array(p.count);
          const frag = document.createDocumentFragment();
          for (let i = 0; i < p.count; i++) {
            const c = document.createElementNS(SVG_NS, "circle");
            c.setAttribute("r", p.radius[i].toFixed(2));
            const r = Math.round(p.color[i * 3] * 255);
            const g = Math.round(p.color[i * 3 + 1] * 255);
            const b = Math.round(p.color[i * 3 + 2] * 255);
            c.setAttribute("fill", `rgb(${r},${g},${b})`);
            circles[i] = c;
            frag.appendChild(c);
          }
          svg.appendChild(frag);
          circlesRef.current = circles;
        }

        for (let i = 0; i < p.count; i++) {
          const c = circles[i];
          c.setAttribute("cx", p.x[i].toFixed(1));
          c.setAttribute("cy", p.y[i].toFixed(1));
        }
      },
    }),
    [],
  );

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="stage-surface"
    />
  );
});

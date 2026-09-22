import type { ParticleStore } from "../engine/particles";

export interface RendererHandle {
  draw(particles: ParticleStore): void;
}

export interface RendererProps {
  width: number;
  height: number;
}

export type Technique = "svg" | "canvas" | "webgl";

export const TECHNIQUES: Technique[] = ["svg", "canvas", "webgl"];

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  svg: "SVG",
  canvas: "Canvas 2D",
  webgl: "WebGL",
};

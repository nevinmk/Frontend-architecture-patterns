import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ParticleStore } from "../engine/particles";
import { createProgram } from "./webgl-utils";
import type { RendererHandle, RendererProps } from "./types";

// WebGL hands the whole job to the GPU: one draw call renders every particle
// as a point sprite, in parallel, on hardware built for exactly this. The
// only per-frame CPU work is re-uploading the position buffer (a straight
// memcpy) — radius and color are static and uploaded once. That's why this
// is the one technique whose frame cost barely moves as `count` climbs from
// 10k to 100k+, while SVG and Canvas scale roughly linearly with it.
const VERTEX_SOURCE = `
  attribute vec2 aPosition;
  attribute float aRadius;
  attribute vec3 aColor;
  uniform vec2 uResolution;
  varying vec3 vColor;

  void main() {
    vec2 zeroToOne = aPosition / uResolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
    gl_PointSize = aRadius * 2.0;
    vColor = aColor;
  }
`;

const FRAGMENT_SOURCE = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    // gl_PointCoord runs 0..1 across the sprite's quad; discard the corners
    // so each point renders as a circle instead of a square.
    vec2 centered = gl_PointCoord - vec2(0.5);
    if (dot(centered, centered) > 0.25) {
      discard;
    }
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

interface GlState {
  gl: WebGLRenderingContext;
  positionBuffer: WebGLBuffer;
  radiusBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
  positionData: Float32Array;
  /** Particle count the radius/color buffers were last populated for. */
  initializedCount: number;
}

export const WebglRenderer = forwardRef<RendererHandle, RendererProps>(function WebglRenderer(
  { width, height },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GlState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) {
      console.error("WebGL is not available in this browser.");
      return;
    }

    const program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
    gl.useProgram(program);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    gl.uniform2f(uResolution, width, height);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aRadius = gl.getAttribLocation(program, "aRadius");
    const aColor = gl.getAttribLocation(program, "aColor");

    const positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Radius and color never change after the particle store is created, so
    // they're uploaded once here and left bound for every subsequent draw.
    const radiusBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, radiusBuffer);
    gl.enableVertexAttribArray(aRadius);
    gl.vertexAttribPointer(aRadius, 1, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    gl.clearColor(0.043, 0.086, 0.125, 1);

    stateRef.current = {
      gl,
      positionBuffer,
      radiusBuffer,
      colorBuffer,
      positionData: new Float32Array(0),
      initializedCount: -1,
    };

    return () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(radiusBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteProgram(program);
    };
  }, [width, height]);

  useImperativeHandle(
    ref,
    () => ({
      draw(p: ParticleStore) {
        const state = stateRef.current;
        if (!state) return;
        const { gl, positionBuffer, radiusBuffer, colorBuffer } = state;

        if (state.initializedCount !== p.count) {
          gl.bindBuffer(gl.ARRAY_BUFFER, radiusBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, p.radius, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, p.color, gl.STATIC_DRAW);
          state.positionData = new Float32Array(p.count * 2);
          state.initializedCount = p.count;
        }

        const positions = state.positionData;
        for (let i = 0; i < p.count; i++) {
          positions[i * 2] = p.x[i];
          positions[i * 2 + 1] = p.y[i];
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.POINTS, 0, p.count);
      },
    }),
    [],
  );

  return <canvas ref={canvasRef} width={width} height={height} className="stage-surface" />;
});

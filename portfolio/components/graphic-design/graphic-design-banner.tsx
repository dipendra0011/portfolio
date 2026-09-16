"use client";

import { extend, useFrame, type ThreeElement } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const QUOTE = "The design is not the design.";
const UNIT = `${QUOTE}    ·    `;

/** Same sine-ribbon material as the pmndrs cards-with-border-radius demo. */
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  time: { value: number };

  constructor(parameters: THREE.MeshBasicMaterialParameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
  }

  onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
    shader.uniforms.time = this.time;
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`,
    );
  }
}

extend({ MeshSineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshSineMaterial: ThreeElement<typeof MeshSineMaterial>;
  }
}

function createQuoteTexture() {
  const probe = document.createElement("canvas");
  const probeCtx = probe.getContext("2d");
  if (!probeCtx) return null;

  const font = '700 72px "Plus Jakarta Sans", Arial, sans-serif';
  probeCtx.font = font;
  const unitWidth = Math.max(1, Math.ceil(probeCtx.measureText(UNIT).width));

  const canvas = document.createElement("canvas");
  canvas.width = unitWidth;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111111";
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(UNIT, 0, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 1);
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

export function GraphicDesignBanner({
  radius = 1.6,
  progressRef,
}: {
  radius?: number;
  progressRef: MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lastProgress = useRef(progressRef.current);
  const texture = useMemo(() => createQuoteTexture(), []);

  useFrame((_, delta) => {
    const progress = progressRef.current ?? 0;
    const scrolled = progress - lastProgress.current;
    lastProgress.current = progress;

    if (texture) texture.offset.x += delta * 0.18;

    const material = meshRef.current?.material as MeshSineMaterial | undefined;
    if (material?.time) {
      material.time.value += Math.abs(scrolled) * 10 + delta * 0.45;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} position={[0, -0.15, 0]}>
      <cylinderGeometry args={[radius, radius, 0.14, 128, 16, true]} />
      <meshSineMaterial
        map={texture}
        map-anisotropy={16}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

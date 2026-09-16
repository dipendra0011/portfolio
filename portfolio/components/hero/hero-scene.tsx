"use client";

import { Image } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { figmaAssets } from "@/lib/figma-assets";

const PLANES = [
  {
    url: figmaAssets.projectA,
    position: [-1.55, 0.35, 0.2] as const,
    rotation: [0.08, 0.42, 0.05] as const,
    scale: [1.55, 1.08, 1] as const,
  },
  {
    url: figmaAssets.projectB,
    position: [1.45, -0.15, -0.4] as const,
    rotation: [-0.06, -0.38, -0.04] as const,
    scale: [1.4, 0.98, 1] as const,
  },
  {
    url: figmaAssets.projectC,
    position: [0.15, 0.85, -1.1] as const,
    rotation: [0.04, 0.12, -0.02] as const,
    scale: [1.15, 0.8, 1] as const,
  },
  {
    url: figmaAssets.rectangle2,
    position: [-0.2, -0.95, -0.7] as const,
    rotation: [-0.1, 0.18, 0.03] as const,
    scale: [1.25, 0.88, 1] as const,
  },
] as const;

function FloatingPlanes({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const progress = progressRef.current ?? 0;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.12) * 0.08;
      group.current.position.y = Math.sin(t * 0.35) * 0.06;
    }
    const camZ = 8.2 - progress * 2.4;
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 1.4, state.pointer.y * 0.6 + 0.25, camZ],
      0.35,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {PLANES.map((plane) => (
        <Image
          key={plane.url + plane.position.join(",")}
          url={plane.url}
          position={[...plane.position]}
          rotation={[...plane.rotation]}
          scale={[...plane.scale]}
          radius={0.08}
          transparent
          toneMapped={false}
        />
      ))}
    </group>
  );
}

export type HeroSceneProps = {
  progressRef: MutableRefObject<number>;
  active: boolean;
};

export function HeroScene({ progressRef, active }: HeroSceneProps) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#f0f1fa]">
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0.25, 8.2], fov: 32 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f0f1fa", 1);
        }}
      >
        <color attach="background" args={["#f0f1fa"]} />
        <fog attach="fog" args={["#f0f1fa", 8, 16]} />
        <mesh position={[2.4, 1.2, -3]} scale={[6, 6, 1]}>
          <planeGeometry />
          <meshBasicMaterial color="#1a2ffb" transparent opacity={0.08} />
        </mesh>
        <Suspense fallback={null}>
          <FloatingPlanes progressRef={progressRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

"use client";

import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { GraphicDesignItem } from "@/lib/graphic-design";
import { GraphicDesignBanner } from "./graphic-design-banner";
import { GraphicDesignCard } from "./graphic-design-card";

const LOOP_TURNS = 3;
const FOG = "#f0f1fa";

function Rig({
  progressRef,
  ...props
}: ThreeElements["group"] & { progressRef: MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const amount = progressRef.current ?? 0;
    const targetY = -amount * Math.PI * 2 * LOOP_TURNS;
    easing.damp(ref.current.rotation, "y", targetY, 0.55, delta);
    state.events.update?.();
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={ref} {...props} />;
}

function CardRing({
  items,
  radius = 1.4,
}: {
  items: GraphicDesignItem[];
  radius?: number;
}) {
  const slides = useMemo(() => {
    if (items.length === 0) return [];
    const count = Math.max(items.length, 8);
    return Array.from({ length: count }, (_, i) => items[i % items.length]);
  }, [items]);

  const count = slides.length;
  if (count === 0) return null;

  return (
    <>
      {slides.map((item, i) => (
        <GraphicDesignCard
          key={`${item.imageUrl}-${item.title}-${i}`}
          imageUrl={item.imageUrl}
          title={item.title}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
        />
      ))}
    </>
  );
}

export type GraphicDesignSceneProps = {
  items: GraphicDesignItem[];
  progressRef: MutableRefObject<number>;
};

export function GraphicDesignScene({
  items,
  progressRef,
}: GraphicDesignSceneProps) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" style={{ background: FOG }}>
      <Canvas
        className="h-full w-full"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 1.5, 10], fov: 15 }}
        onCreated={({ gl }) => {
          gl.setClearColor(FOG, 1);
        }}
      >
        <color attach="background" args={[FOG]} />
        <fog attach="fog" args={[FOG, 8.5, 12]} />
        <Suspense fallback={null}>
          <Rig rotation={[0, 0, 0.15]} progressRef={progressRef}>
            <CardRing items={items} />
          </Rig>
          <GraphicDesignBanner radius={1.6} progressRef={progressRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

"use client";

import { Html, Image } from "@react-three/drei";
import {
  useFrame,
  type ThreeElements,
  type ThreeEvent,
} from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";
import "./bent-geometry";

type ImageMaterial = THREE.MeshBasicMaterial & {
  radius: number;
  zoom: number;
};

export type GraphicDesignCardProps = {
  imageUrl: string;
  title: string;
} & Pick<ThreeElements["mesh"], "position" | "rotation">;

export function GraphicDesignCard({
  imageUrl,
  title,
  ...props
}: GraphicDesignCardProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(true);
  };
  const pointerOut = () => hover(false);

  useFrame((_state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    easing.damp3(mesh.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(mesh.material as ImageMaterial, "radius", hovered ? 0.25 : 0.1, 0.2, delta);
    easing.damp(mesh.material as ImageMaterial, "zoom", hovered ? 1 : 1.5, 0.2, delta);
  });

  return (
    <group {...props}>
      <Image
        ref={ref}
        url={imageUrl}
        transparent
        side={THREE.DoubleSide}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
      </Image>
      {hovered ? (
        <Html
          center
          position={[0, -0.72, 0]}
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <span className="rounded-full bg-black/70 px-3 py-1 font-[family-name:var(--font-instrument)] text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
            {title}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

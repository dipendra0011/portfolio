"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Mesh,
  Vector2,
  SRGBColorSpace,
  LinearFilter,
  type Texture,
} from "three";
import { ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { DEAL_STAGGER, RELEASE_EVENT, isHeld } from "./entrance-hold";

/*
 * Project thumbnails as WebGL planes:
 *
 *   - scroll: a screen-space UV warp that pushes the top and bottom of the
 *     viewport outward while the page moves. The DOM text never distorts.
 *   - entrance: rounded mask grows 70% -> 100% while the image zooms out
 *     1.33x -> 1x (1.5s expoOut), and the plane slides in from the page
 *     centre with a slight tilt (2s expoOut). Replays on every re-entry.
 *   - hover: a water ripple spreading out from the cursor — the plane's
 *     vertices bob in z (real perspective) and the texture wobbles with them.
 */

const CORNER_RADIUS = 4; // matches --radius-lg (scoped to .projects in projects-section.css)
const MOBILE_BREAKPOINT = 769;

/** Must stay in sync with .projects__canvas's negative inset in
 *  projects-section.css. */
const BLEED = 120;

/** Horizontal padding on each plane, as a fraction of card width. The scroll
 *  warp shifts the card's silhouette sideways; the quad has to extend past
 *  the DOM box to have pixels there. */
const PAD_X = 0.1;

/** Scroll warp — strength is an exponentially decayed sum of |scroll delta|
 *  measured in viewport heights per frame. */
const WARP_MAX = 0.15;
const WARP_GAIN = 0.5;
const WARP_DECAY = 10;

const SHOW_DURATION = 1.5; // mask grow + image un-zoom
const SLIDE_DURATION = 2; // slide in from centre + un-tilt
const SLIDE_DISTANCE = 0.1; // x viewport width, split either side of centre
const SLIDE_TILT = 0.1; // radians, split either side

/** Hover follow: 10% of the way per 60Hz frame, made frame-rate independent. */
const HOVER_LERP = 0.1;

/** Vertex grid. The ripple is vertex displacement, so the plane needs enough
 *  segments for the rings to show in the silhouette, not just the texture. */
const SEGMENTS = 32;

const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const saturate = (t: number) => Math.min(1, Math.max(0, t));

const vertexShader = /* glsl */ `
  uniform vec2 uBox;
  uniform float uPadX;
  uniform float uShow;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // The plane is padded sideways past the DOM box; the cursor is measured
    // in DOM-box UV, so map into that space before measuring distance.
    vec2 boxUv = vec2((uv.x * (uBox.x + 2.0 * uPadX) - uPadX) / uBox.x, uv.y);

    // Held back until the entrance has essentially finished, so the ripple
    // never fights the mask/zoom mid-entrance.
    float settled = smoothstep(0.85, 1.0, uShow);
    float dist = distance(boxUv, uMouse);
    float ripple = sin(dist * 40.0 - uTime * 4.0) * exp(-dist * 6.0);
    // CSS px — the camera is distance-matched so 1 unit = 1px at z = 0, and
    // the perspective divide turns the z bob into real foreshortening.
    pos.z += ripple * uHover * settled * 26.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  #define PI 3.141592653589793

  uniform sampler2D uTexture;
  uniform vec2 uImageSize;
  uniform vec2 uBox;        // DOM box size, CSS px
  uniform float uPadX;      // plane padding either side, CSS px
  uniform float uRadius;
  uniform float uShow;      // entrance, 0..1 (already eased)
  uniform float uWarp;      // scroll warp strength
  uniform vec2 uCanvasOrigin; // canvas top-left in viewport CSS px
  uniform float uCanvasHeight;
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform float uTime;
  uniform vec2 uMouse;      // cursor in DOM-box UV, lerped
  uniform float uHover;     // 0..1, lerped

  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float imageAspect = uImageSize.x / uImageSize.y;
    float boxAspect = uBox.x / uBox.y;
    vec2 scale = imageAspect > boxAspect
      ? vec2(boxAspect / imageAspect, 1.0)
      : vec2(1.0, imageAspect / boxAspect);
    return (uv - 0.5) * scale + 0.5;
  }

  float roundedBoxSDF(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  void main() {
    // Card-local CSS px, origin at the DOM box's bottom-left.
    vec2 px = vUv * vec2(uBox.x + 2.0 * uPadX, uBox.y) - vec2(uPadX, 0.0);

    // Screen-space scroll warp: fragments far from the viewport's vertical
    // centre are pushed horizontally away from its horizontal centre.
    vec2 frag = gl_FragCoord.xy / uDpr;
    vec2 screen = vec2(uCanvasOrigin.x + frag.x, uCanvasOrigin.y + uCanvasHeight - frag.y);
    vec2 s = clamp(screen / uViewport, 0.0, 1.0);
    px.x -= (s.x - 0.5) * (1.0 - sin(s.y * PI)) * uWarp * uBox.x;

    // Entrance mask: rounded box grows from 70% to full size about its centre.
    float d = roundedBoxSDF(px - uBox * 0.5, uBox * 0.5 * mix(0.7, 1.0, uShow), uRadius);
    float mask = 1.0 - smoothstep(-0.75, 0.75, d);
    if (mask <= 0.0) discard;

    vec2 uv = px / uBox;

    // Texture-space wobble on top of the vertex ripple — without it the
    // ripple only shows in the silhouette, not on the image itself.
    float dist = distance(uv, uMouse);
    float wobble = sin(dist * 30.0 - uTime * 3.0) * 0.02 * exp(-dist * 5.0);
    uv += wobble * uHover;

    // Entrance zoom: 0.75 (1.33x) easing out to 1.
    uv = (uv - 0.5) * mix(0.75, 1.0, uShow) + 0.5;

    vec3 color = texture2D(uTexture, coverUv(uv)).rgb;

    float appear = smoothstep(0.0, 0.25, uShow);
    gl_FragColor = vec4(color, mask * appear);
  }
`;

type CardUniforms = {
  uTexture: { value: Texture | null };
  uImageSize: { value: Vector2 };
  uBox: { value: Vector2 };
  uPadX: { value: number };
  uRadius: { value: number };
  uShow: { value: number };
  uWarp: { value: number };
  uCanvasOrigin: { value: Vector2 };
  uCanvasHeight: { value: number };
  uViewport: { value: Vector2 };
  uDpr: { value: number };
  uTime: { value: number };
  uMouse: { value: Vector2 };
  uHover: { value: number };
};

type Card = {
  media: HTMLElement;
  mesh: Mesh;
  material: ShaderMaterial;
  uniforms: CardUniforms;
  /** Grid-relative DOM box, refreshed on resize. */
  rect: { left: number; top: number; width: number; height: number };
  /** Resting mesh position (card centre in world space). */
  base: Vector2;
  /** -1 left column, +1 right column: which way the entrance slides from. */
  side: number;
  showTime: number;
  targetMouse: Vector2;
  targetHover: number;
};

function noMipmaps(texture: Texture) {
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
}

/** `offsetLeft` is relative to the nearest positioned ancestor, which is the
 *  card — not the grid — so the chain has to be summed. Deliberately not
 *  getBoundingClientRect: offset* reports the pre-transform layout box. */
function getOffsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top, width: el.offsetWidth, height: el.offsetHeight };
}

export function ProjectsCanvas({ gridRef }: { gridRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    const canvas = canvasRef.current;
    if (!grid || !canvas) return;

    if (
      !window.matchMedia(MOTION_OK).matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.innerWidth < MOBILE_BREAKPOINT
    ) {
      return;
    }

    const mediaEls = Array.from(grid.querySelectorAll<HTMLElement>(".project-card__media"));
    if (mediaEls.length === 0) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL — the plain <img> in each card stays visible.
      return;
    }

    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    // Perspective with the camera distance-matched so 1 world unit = 1 CSS px
    // at z = 0 — planes line up 1:1 with their DOM boxes, and the ripple's z
    // displacement actually foreshortens.
    const FOV = 45;
    const cameraDistance = (height: number) =>
      height / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
    const camera = new PerspectiveCamera(FOV, 1, 1, 10000);

    const loader = new TextureLoader();
    let texturesLoaded = 0;
    const geometry = new PlaneGeometry(1, 1, SEGMENTS, SEGMENTS);

    const cards: Card[] = mediaEls.map((media, index) => {
      const img = media.querySelector("img");
      const src = img?.getAttribute("src") ?? "";

      const uniforms: CardUniforms = {
        uTexture: { value: null },
        uImageSize: { value: new Vector2(1, 1) },
        uBox: { value: new Vector2(1, 1) },
        uPadX: { value: 0 },
        uRadius: { value: CORNER_RADIUS },
        uShow: { value: 0 },
        uWarp: { value: 0 },
        uCanvasOrigin: { value: new Vector2() },
        uCanvasHeight: { value: 1 },
        uViewport: { value: new Vector2(window.innerWidth, window.innerHeight) },
        uDpr: { value: dpr },
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
      };

      const texture = loader.load(src, (loaded) => {
        uniforms.uImageSize.value.set(loaded.image.width, loaded.image.height);
        texturesLoaded += 1;
      });
      texture.colorSpace = SRGBColorSpace;
      noMipmaps(texture);
      uniforms.uTexture.value = texture;

      const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new Mesh(geometry, material);
      mesh.renderOrder = index;
      scene.add(mesh);

      return {
        media,
        mesh,
        material,
        uniforms,
        rect: { left: 0, top: 0, width: 1, height: 1 },
        base: new Vector2(),
        side: index % 2 ? 1 : -1,
        showTime: 0,
        targetMouse: new Vector2(0.5, 0.5),
        targetHover: 0,
      };
    });

    let gridWidth = 0;
    let gridHeight = 0;

    const setSize = () => {
      gridWidth = grid.offsetWidth;
      gridHeight = grid.offsetHeight;
      const canvasWidth = gridWidth + BLEED * 2;
      const canvasHeight = gridHeight + BLEED * 2;
      renderer.setSize(canvasWidth, canvasHeight, false);
      camera.aspect = canvasWidth / canvasHeight;
      camera.position.z = cameraDistance(canvasHeight);
      camera.updateProjectionMatrix();

      cards.forEach((card) => {
        const rect = getOffsetWithin(card.media, grid);
        card.rect = rect;
        // Card centre in canvas world space, Y flipped. BLEED cancels out.
        card.base.set(
          rect.left + rect.width / 2 - gridWidth / 2,
          gridHeight / 2 - (rect.top + rect.height / 2)
        );
        const padX = rect.width * PAD_X;
        card.mesh.scale.set(rect.width + padX * 2, rect.height, 1);
        card.uniforms.uBox.value.set(rect.width, rect.height);
        card.uniforms.uPadX.value = padX;
        card.uniforms.uCanvasHeight.value = canvasHeight;
      });
    };
    setSize();

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(grid);

    // Hover listeners go on the DOM media element, never the canvas — the
    // canvas is pointer-events:none so it never blocks the page beneath it.
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      const handleMove = (event: MouseEvent) => {
        const rect = card.media.getBoundingClientRect();
        card.targetMouse.set(
          (event.clientX - rect.left) / rect.width,
          1 - (event.clientY - rect.top) / rect.height
        );
      };
      const handleEnter = (event: MouseEvent) => {
        handleMove(event);
        card.targetHover = 1;
      };
      const handleLeave = () => {
        card.targetHover = 0;
      };

      card.media.addEventListener("mousemove", handleMove);
      card.media.addEventListener("mouseenter", handleEnter);
      card.media.addEventListener("mouseleave", handleLeave);
      cleanups.push(() => {
        card.media.removeEventListener("mousemove", handleMove);
        card.media.removeEventListener("mouseenter", handleEnter);
        card.media.removeEventListener("mouseleave", handleLeave);
      });
    });

    let frame = 0;
    let visible = false;
    let handedOver = false;
    const startTime = performance.now();
    let lastFrameTime = performance.now();
    let lastCanvasTop = Number.NaN;
    let scrollStrength = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      const now = performance.now();
      // Clamped: a tab restore or GC pause shouldn't fast-forward entrances.
      const dt = Math.min((now - lastFrameTime) / 1000, 1 / 20);
      lastFrameTime = now;
      const time = (now - startTime) / 1000;
      const follow = 1 - Math.pow(1 - HOVER_LERP, dt * 60);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // One layout read per frame: where the canvas actually is on screen
      // (after ScrollSmoother's transform) gives both the warp's screen-space
      // origin and the true visual scroll delta.
      const canvasRect = canvas.getBoundingClientRect();
      const delta = Number.isNaN(lastCanvasTop) ? 0 : (canvasRect.top - lastCanvasTop) / vh;
      lastCanvasTop = canvasRect.top;
      scrollStrength += Math.abs(delta);
      scrollStrength += (0 - scrollStrength) * (1 - Math.exp(-WARP_DECAY * dt));
      scrollStrength = Math.min(scrollStrength, 1);
      const warp = Math.min(WARP_MAX, scrollStrength * WARP_GAIN);
      // Held by the page (Work title still landing): stay parked at the start.
      const held = isHeld(grid);

      cards.forEach((card) => {
        const u = card.uniforms;
        u.uWarp.value = warp;
        u.uCanvasOrigin.value.set(canvasRect.left, canvasRect.top);
        u.uViewport.value.set(vw, vh);

        // Entrance clock runs while any part of the card is on screen and
        // resets the moment it leaves, so it replays on every re-entry.
        const top = canvasRect.top + BLEED + card.rect.top;
        const inView = top < vh && top + card.rect.height > 0;
        card.showTime = inView && !held ? card.showTime + dt : 0;
        u.uShow.value = expoOut(saturate(card.showTime / SHOW_DURATION));
        const slide = 1 - expoOut(saturate(card.showTime / SLIDE_DURATION));
        card.mesh.position.set(
          card.base.x - card.side * slide * vw * SLIDE_DISTANCE * 0.5,
          card.base.y,
          0
        );
        card.mesh.rotation.z = card.side * slide * SLIDE_TILT * 0.5;

        // Hover ripple.
        u.uTime.value = time;
        u.uHover.value += (card.targetHover - u.uHover.value) * follow;
        u.uMouse.value.lerp(card.targetMouse, follow);
      });

      try {
        renderer.render(scene, camera);
      } catch {
        // A driver/context failure mid-flight must not leave the cards blank:
        // stop rendering and hand the visuals back to the real <img>s.
        cancelAnimationFrame(frame);
        grid.classList.remove("projects__grid--gl");
        return;
      }

      // The <img>s are only hidden once every texture has decoded AND a frame
      // has actually rendered.
      if (!handedOver && texturesLoaded === cards.length) {
        handedOver = true;
        grid.classList.add("projects__grid--gl");
      }
    };

    // Nothing renders while the section is off-screen.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          visible = true;
          lastFrameTime = performance.now();
          lastCanvasTop = Number.NaN;
          frame = requestAnimationFrame(render);
        } else if (!entry.isIntersecting && visible) {
          visible = false;
          cancelAnimationFrame(frame);
          cards.forEach((card) => {
            card.showTime = 0;
          });
        }
      },
      { rootMargin: "200px" }
    );
    visibilityObserver.observe(grid);

    // Released: deal the on-screen cards in one after another. A negative
    // clock is a wait (the entrance saturates at 0 until it passes).
    const onRelease = () => {
      const vh = window.innerHeight;
      const canvasTop = canvas.getBoundingClientRect().top;
      let order = 0;
      cards.forEach((card) => {
        const top = canvasTop + BLEED + card.rect.top;
        if (top < vh && top + card.rect.height > 0) card.showTime = -DEAL_STAGGER * order++;
      });
    };
    window.addEventListener(RELEASE_EVENT, onRelease);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener(RELEASE_EVENT, onRelease);
      cleanups.forEach((fn) => fn());
      cards.forEach((card) => {
        scene.remove(card.mesh);
        card.material.dispose();
        card.uniforms.uTexture.value?.dispose();
      });
      geometry.dispose();
      // No WEBGL_lose_context: this canvas is reused across StrictMode's dev
      // remount, and a forced context loss can't be recovered on it.
      renderer.dispose();
      grid.classList.remove("projects__grid--gl");
      ScrollTrigger.refresh();
    };
  }, [gridRef]);

  return <canvas ref={canvasRef} className="projects__canvas" aria-hidden />;
}

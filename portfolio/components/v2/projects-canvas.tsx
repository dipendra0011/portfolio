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
  type Texture,
} from "three";
import { gsap, ScrollTrigger, MOTION_OK, getSmoother } from "@/lib/v2-gsap";

const CORNER_RADIUS = 12; // matches --radius-lg
const MOBILE_BREAKPOINT = 769;
const HOVER_LERP = 0.1;

/** Must stay in sync with .projects__canvas's negative inset in projects.css.
 *  The canvas is drawn larger than the grid on every side so a card bending
 *  toward the viewer near a grid edge isn't sliced off by the canvas bounds. */
const BLEED = 120;

/** Velocity that maps to a full-strength bend, in px/sec.
 *
 *  Deliberately lower than footer.tsx's 2500: that number grades a one-shot
 *  intensity off ScrollTrigger's raw velocity, whereas this reads
 *  ScrollSmoother's *smoothed* velocity continuously, which runs far lower
 *  for the same input. Measured on this page, an ordinary scroll sits around
 *  300 px/s and a brisk one around 900. Lowered further from 900 so an
 *  ordinary scroll reaches most of the bend's range, not just brisk ones —
 *  the reference (lusion.co/projects) reads as strongly warped even at
 *  regular scroll speed. */
const MAX_SCROLL_VELOCITY = 950;

const FIXED_DT = 1 / 120;
const STIFFNESS = 90; // settles in roughly 0.45s
const DAMPING = 11; // damping ratio ~0.58 — a couple of visible overshoots
const MAX_FRAME_DT = 1 / 20; // clamps tab-restore/GC spikes

type Spring = { x: number; v: number; acc: number };

/** Fixed-timestep semi-implicit Euler. A plain delta-scaled integrator would
 *  change its effective stiffness with frame rate (a 120Hz display would feel
 *  twice as stiff as 60Hz) and can diverge outright on a long frame. */
function stepSpring(spring: Spring, target: number, frameDt: number, stiffness: number) {
  spring.acc += Math.min(frameDt, MAX_FRAME_DT);
  while (spring.acc >= FIXED_DT) {
    const accel = stiffness * (target - spring.x) - DAMPING * spring.v;
    spring.v += accel * FIXED_DT;
    spring.x += spring.v * FIXED_DT;
    spring.acc -= FIXED_DT;
  }
  return spring.x;
}

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uBend;

  varying vec2 vUv;
  varying float vCurl;
  varying float vBend;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float eased = 1.0 - pow(1.0 - uProgress, 3.0);
    float remain = 1.0 - eased;

    // Weighted toward the TOP-left corner: a card scrolls up into view top
    // edge first, so a bottom-weighted peel would play out in the part of
    // the card that's still below the fold. Deliberately not sin(edge * PI)
    // either — that peaks mid-plane and is zero at the very edge, which
    // reads as a vague bulge instead of a corner actually lifting.
    float corner = uv.y * 0.75 + (1.0 - uv.x) * 0.25;
    float curl = pow(corner, 1.6) * remain;

    // Amplitudes are CSS px — the camera is distance-matched so 1 unit = 1px
    // at z = 0, and the perspective divide turns the z lift into real
    // foreshortening rather than a flat scale.
    pos.z += curl * 320.0;
    pos.y += curl * 90.0;
    pos.x -= curl * 40.0;

    // Scroll-velocity bend: the sheet flexes while the page moves and springs
    // flat when it stops (uBend is spring-driven in JS). Both the bow and the
    // trapezoid come from z displacement alone — rotating the mesh instead
    // would rotate its local space and shear the 1:1 pixel alignment with the
    // DOM box, drifting the image against its own caption.
    float arcY = 1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0);
    float arcX = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 2.0);
    float bow = arcY * (0.75 + 0.25 * arcX);
    // A linear z ramp is what the perspective divide turns into a trapezoid:
    // the near edge renders wider than the receding one.
    float tilt = (uv.y - 0.5) * 2.0;

    // Gated late so it can't stack with the entrance curl's 320px lift — a
    // fling mid-entrance would otherwise sum into a wild pop.
    // These 3 numbers (bow's z, tilt's z, bow's y) are the entire "how much
    // does it bend" dial — scale all three together to keep the bow:tilt:y
    // ratio (and therefore the bend's shape) the same. +10% up from the
    // 13/14/3 pass, which read as basically invisible.
    float bendGate = smoothstep(0.7, 1.0, uProgress);
    pos.z += (bow * 15.73 + tilt * 16.94) * uBend * bendGate;
    pos.y += bow * -3.63 * uBend * bendGate;

    // Held back until the unfurl has essentially finished, so the two
    // displacement sources never fight for the same vertices mid-entrance.
    float settled = smoothstep(0.85, 1.0, uProgress);
    float dist = distance(uv, uMouse);
    float ripple = sin(dist * 40.0 - uTime * 4.0) * exp(-dist * 6.0);
    pos.z += ripple * uHover * settled * 26.0;

    vCurl = curl;
    vBend = bow * uBend * bendGate;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uImageSize;
  uniform vec2 uResolution;
  uniform float uRadius;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uProgress;

  varying vec2 vUv;
  varying float vCurl;
  varying float vBend;

  vec2 coverUv(vec2 uv, vec2 imageSize, vec2 boxSize) {
    float imageAspect = imageSize.x / imageSize.y;
    float boxAspect = boxSize.x / boxSize.y;
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
    vec2 uv = vUv;

    // Texture-space wobble on top of the geometry displacement — without it
    // the ripple only shows in the silhouette, not on the image itself.
    float dist = distance(uv, uMouse);
    float wobble = sin(dist * 30.0 - uTime * 3.0) * 0.02 * exp(-dist * 5.0);
    uv += wobble * uHover;

    vec4 color = texture2D(uTexture, coverUv(uv, uImageSize, uResolution));

    // The canvas lives outside .project-card__media's overflow:hidden, so
    // the rounded corners have to be masked here or every card renders as a
    // hard rectangle.
    vec2 local = (vUv - 0.5) * uResolution;
    float d = roundedBoxSDF(local, uResolution * 0.5, uRadius);
    float mask = 1.0 - smoothstep(-1.5, 1.5, d);

    // Shading cue: the lifted part of the sheet sits in its own shadow. The
    // bend term is signed, so a sheet flexing toward the viewer catches a
    // little light while one flexing away darkens — kept small so it reads as
    // shading rather than a brightness flicker while scrolling.
    color.rgb *= 1.0 - clamp(vCurl, 0.0, 1.0) * 0.45;
    color.rgb *= 1.0 + clamp(vBend, -1.0, 1.0) * 0.12;

    // Fades in over the first third of the unfurl so the card arrives with
    // the motion instead of popping in already-opaque.
    float appear = smoothstep(0.0, 0.35, uProgress);

    gl_FragColor = vec4(color.rgb, color.a * mask * appear);
  }
`;

type CardUniforms = {
  uProgress: { value: number };
  uTexture: { value: Texture | null };
  uMouse: { value: Vector2 };
  uHover: { value: number };
  uTime: { value: number };
  uResolution: { value: Vector2 };
  uImageSize: { value: Vector2 };
  uRadius: { value: number };
  uBend: { value: number };
};

type Card = {
  media: HTMLElement;
  mesh: Mesh;
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  uniforms: CardUniforms;
  targetMouse: Vector2;
  targetHover: number;
};

/** `offsetLeft` is relative to the nearest positioned ancestor, which is the
 *  card — not the grid — so the chain has to be summed. Deliberately not
 *  getBoundingClientRect: offset* reports the pre-transform layout box, which
 *  is immune to the entrance animation's CSS transform on .project-card. */
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
      // No WebGL2 — the plain <img> in each card stays visible, so the
      // section just renders without the effect.
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    // Perspective, not orthographic — an orthographic projection discards Z
    // entirely, so every bit of the curl/ripple displacement (which is mostly
    // along Z) would render as a perfectly flat image. Pulling the camera back
    // to exactly height / 2tan(fov/2) makes one world unit equal one CSS pixel
    // at z = 0, so planes still line up 1:1 with their DOM boxes while depth
    // now actually foreshortens.
    const FOV = 45;
    const cameraDistance = (height: number) =>
      height / 2 / Math.tan((FOV / 2) * (Math.PI / 180));

    // The camera frames the bled canvas, not the grid — see setSize().
    const camera = new PerspectiveCamera(
      FOV,
      (grid.offsetWidth + BLEED * 2) / (grid.offsetHeight + BLEED * 2),
      1,
      10000
    );
    camera.position.z = cameraDistance(grid.offsetHeight + BLEED * 2);

    const loader = new TextureLoader();
    let texturesLoaded = 0;

    const cards: Card[] = mediaEls.map((media, index) => {
      const rect = getOffsetWithin(media, grid);
      const img = media.querySelector("img");
      const src = img?.getAttribute("src") ?? "";

      const uniforms: CardUniforms = {
        uProgress: { value: 0 },
        uTexture: { value: null },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new Vector2(rect.width, rect.height) },
        // Real size comes from the decoded texture below — the cards don't
        // share one image and their aspect ratios differ, so the cover-fit
        // maths in the shader can't assume a single hardcoded size.
        uImageSize: { value: new Vector2(1, 1) },
        uRadius: { value: CORNER_RADIUS },
        uBend: { value: 0 },
      };

      const texture = loader.load(src, (loaded) => {
        uniforms.uImageSize.value.set(loaded.image.width, loaded.image.height);
        texturesLoaded += 1;
      });
      texture.colorSpace = SRGBColorSpace;
      uniforms.uTexture.value = texture;

      // 32x32, not 24x16: the bow varies mostly along Y, and 16 segments over
      // a ~400px card leaves ~25px facets that show up on the silhouette.
      const geometry = new PlaneGeometry(rect.width, rect.height, 32, 32);
      const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new Mesh(geometry, material);
      // Explicit order because three sorts transparent meshes by bounding
      // sphere, which vertex displacement never moves — without this a far
      // card's bowed edge can draw over a nearer one. depthWrite stays off:
      // enabling it would let the rounded-corner alpha punch holes in
      // whatever is behind.
      mesh.renderOrder = index;
      scene.add(mesh);

      return {
        media,
        mesh,
        geometry,
        material,
        uniforms,
        targetMouse: new Vector2(0.5, 0.5),
        targetHover: 0,
      };
    });

    // One spring for the whole section, not one per card — the section reads
    // as a single sheet reacting to scroll, not four cards flexing out of
    // phase with each other.
    const bendSpring: Spring = { x: 0, v: 0, acc: 0 };

    const setSize = () => {
      const width = grid.offsetWidth;
      const height = grid.offsetHeight;
      // The canvas is BLEED px larger than the grid on every side so a card
      // bending toward the viewer at a grid edge isn't clipped. The drawing
      // buffer and camera frustum have to cover that whole bled area.
      const canvasWidth = width + BLEED * 2;
      const canvasHeight = height + BLEED * 2;
      renderer.setSize(canvasWidth, canvasHeight, false);
      camera.aspect = canvasWidth / canvasHeight;
      camera.position.z = cameraDistance(canvasHeight);
      camera.updateProjectionMatrix();

      cards.forEach((card) => {
        const rect = getOffsetWithin(card.media, grid);
        // Centre the card in canvas space and flip Y (world Y points up).
        // The BLEED offset cancels out — a card's canvas-space centre is
        // BLEED + rect.left + w/2 and the canvas centre is BLEED + width/2 —
        // so these expressions are bleed-independent by construction. Don't
        // "fix" them by adding BLEED.
        card.mesh.position.set(
          rect.left + rect.width / 2 - width / 2,
          height / 2 - (rect.top + rect.height / 2),
          0
        );
        card.mesh.scale.set(
          rect.width / card.geometry.parameters.width,
          rect.height / card.geometry.parameters.height,
          1
        );
        card.uniforms.uResolution.value.set(rect.width, rect.height);
      });
    };
    setSize();

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(grid);

    // Entrance: same trigger/timing as the DOM card settle in projects.tsx,
    // so the text and the image read as one motion.
    const tweens = cards.map((card) =>
      gsap.to(card.uniforms.uProgress, {
        value: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card.media.closest(".project-card") ?? card.media,
          start: "top 85%",
        },
      })
    );

    // Hover listeners go on the DOM media element, never the canvas — the
    // canvas is pointer-events:none so clicks reach the underlying <Link>.
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      const handleMove = (event: MouseEvent) => {
        const rect = card.media.getBoundingClientRect();
        card.targetMouse.set(
          (event.clientX - rect.left) / rect.width,
          1 - (event.clientY - rect.top) / rect.height
        );
      };
      const handleEnter = () => {
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
    const clock = { start: performance.now() };
    let lastFrameTime = performance.now();

    const render = () => {
      frame = requestAnimationFrame(render);
      const now = performance.now();
      const time = (now - clock.start) / 1000;
      const frameDt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // One velocity read per frame, shared by every card — reading it
      // per-card would let them drift out of phase. ScrollSmoother owns scroll
      // on /v2 (Lenis is only in the (main) route group), and its getVelocity
      // needs no layout read. Null until the smoother is constructed.
      const velocity = getSmoother()?.getVelocity() ?? 0;
      const bendTarget = gsap.utils.clamp(
        -1,
        1,
        gsap.utils.mapRange(0, MAX_SCROLL_VELOCITY, 0, 1, velocity)
      );

      const bend = stepSpring(bendSpring, bendTarget, frameDt, STIFFNESS);

      cards.forEach((card) => {
        card.uniforms.uTime.value = time;
        card.uniforms.uHover.value +=
          (card.targetHover - card.uniforms.uHover.value) * HOVER_LERP;
        card.uniforms.uMouse.value.lerp(card.targetMouse, HOVER_LERP);
        card.uniforms.uBend.value = bend;
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
      // has actually rendered — hiding them any earlier (e.g. on renderer
      // construction) shows an empty card if either step fails.
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
          // Reset the frame clock, otherwise the first frame after a pause
          // reports the entire off-screen duration as its delta.
          lastFrameTime = performance.now();
          frame = requestAnimationFrame(render);
        } else if (!entry.isIntersecting && visible) {
          visible = false;
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "200px" }
    );
    visibilityObserver.observe(grid);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cleanups.forEach((fn) => fn());
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      cards.forEach((card) => {
        scene.remove(card.mesh);
        card.geometry.dispose();
        card.material.dispose();
        card.uniforms.uTexture.value?.dispose();
      });
      // Deliberately no WEBGL_lose_context here. This canvas is a stable,
      // React-owned element reused across StrictMode's dev remount, so there
      // is only ever one context bound to it — nothing accumulates. Forcing
      // context loss instead permanently kills that element's context:
      // getContext() afterwards hands back the same lost object rather than a
      // fresh one, and the next mount dies in WebGLCapabilities reading
      // precision off it.
      renderer.dispose();
      grid.classList.remove("projects__grid--gl");
      ScrollTrigger.refresh();
    };
  }, [gridRef]);

  return <canvas ref={canvasRef} className="projects__canvas" aria-hidden />;
}

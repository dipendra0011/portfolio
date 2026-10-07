/*
 * A phone in WebGL (three.js, already a dependency) showing the a-OK launch
 * post in Instagram (the owner's own screen capture). Built from primitives
 * rather than a downloaded model: a black titanium body, glossy black glass,
 * the screen as a texture and the side buttons, lit by three's studio
 * RoomEnvironment so the metal and glass pick up real reflections.
 *
 * It idles (a slow sway and float), leans toward the cursor, and swings in
 * the first time it's shown. It only renders while on screen.
 */

import {
  ACESFilmicToneMapping,
  BoxGeometry,
  ExtrudeGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* Phone proportions, in scene units (about an iPhone 15: 71.6 x 147.6 mm). */
const W = 1;
const H = 2.06;
const D = 0.105;
const CORNER = 0.16;
const BEZEL = 0.035;
/* The rounded edge where the frame meets front and back. */
const BEVEL = 0.022;
/* Curve smoothness for every rounded outline, so corners stay clean up close. */
const CURVE_SEGMENTS = 32;

/* Resting pose: screen turned a little toward the person pointing at it (on
   its left), so its right edge recedes and the peeker can hide behind it. */
const REST_Y = -0.3;
const REST_X = 0.04;
/* Where it swings in from, the first time it's shown. */
const ENTER_Y = -1.25;
const ENTER_SECONDS = 1.6;

/* How far it follows the cursor (radians at the stage's edge). */
const LEAN_Y = 0.22;
const LEAN_X = 0.12;

type Options = {
  canvas: HTMLCanvasElement;
  screenImage: string;
  reduceMotion: boolean;
};

export type PhoneScene = {
  /** Cursor position over the stage, -1..1 on each axis. */
  setPointer: (x: number, y: number) => void;
  /** Start or stop rendering (only while the stage is on screen). */
  setActive: (active: boolean) => void;
  /** Play the swing-in (first appearance). */
  enter: () => void;
  dispose: () => void;
};

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* A rounded rectangle whose UVs span 0..1 across it, so a texture fills it. */
function roundedPlane(w: number, h: number, r: number) {
  const geo = new ShapeGeometry(roundedRect(w, h, r), CURVE_SEGMENTS);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

/* The screen: the owner's screen capture of the post in Instagram (it has
   its own status bar and Dynamic Island), drawn to fill a canvas. */
function drawScreen(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return c;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export async function createPhoneScene({ canvas, screenImage, reduceMotion }: Options): Promise<PhoneScene> {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  // Close enough that the phone fills most of the stage height.
  camera.position.set(0, 0, 4.5);

  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(-2, 3, 4);
  scene.add(key);

  // --- The phone -----------------------------------------------------------
  const phone = new Group();
  scene.add(phone);

  // Black titanium: a crisp dark outline against the white page.
  const titanium = new MeshPhysicalMaterial({
    color: new Color("#2a2a2d"),
    metalness: 1,
    roughness: 0.34,
  });
  // The body is the same rounded rectangle as the glass, extruded with a soft
  // bevel, so frame and glass share one corner curve (a rounded box rounds
  // its corners by its bevel instead, and the metal bulged past the glass).
  const bodyGeo = new ExtrudeGeometry(roundedRect(W - BEVEL * 2, H - BEVEL * 2, CORNER - BEVEL), {
    depth: D - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 8,
    curveSegments: CURVE_SEGMENTS,
  });
  bodyGeo.translate(0, 0, -(D - BEVEL * 2) / 2);
  const body = new Mesh(bodyGeo, titanium);
  phone.add(body);

  // Front glass, with the screen inset under it.
  const glass = new Mesh(
    roundedPlane(W - 0.012, H - 0.012, CORNER - 0.006),
    new MeshPhysicalMaterial({ color: "#050505", roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }),
  );
  glass.position.z = D / 2 + 0.001;
  phone.add(glass);

  const img = new Image();
  img.decoding = "async";
  img.src = screenImage;
  await img.decode();
  const screenW = W - BEZEL * 2;
  const screenH = H - BEZEL * 2;
  const texture = new CanvasTexture(drawScreen(img, 900, Math.round((900 * screenH) / screenW)));
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const screen = new Mesh(
    roundedPlane(screenW, screenH, CORNER - BEZEL),
    new MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  screen.position.z = D / 2 + 0.002;
  phone.add(screen);

  // A thin sheen over the screen so it reads as glass, not a flat picture.
  const sheen = new Mesh(
    roundedPlane(screenW, screenH, CORNER - BEZEL),
    new MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0, clearcoat: 1 }),
  );
  sheen.position.z = D / 2 + 0.003;
  phone.add(sheen);

  // Side buttons: action + volume on the left, power on the right.
  const buttonGeo = new BoxGeometry(0.012, 1, 0.045);
  const addButton = (x: number, y: number, h: number) => {
    const b = new Mesh(buttonGeo, titanium);
    b.scale.y = h;
    b.position.set(x, y, 0);
    phone.add(b);
  };
  addButton(-W / 2 - 0.004, H * 0.31, 0.08);
  addButton(-W / 2 - 0.004, H * 0.19, 0.16);
  addButton(-W / 2 - 0.004, H * 0.08, 0.16);
  addButton(W / 2 + 0.004, H * 0.15, 0.24);

  // --- Sizing --------------------------------------------------------------
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // --- Motion --------------------------------------------------------------
  let active = false;
  let frame = 0;
  let last = 0;
  let time = 0;
  let enterAt = reduceMotion ? -Infinity : Number.POSITIVE_INFINITY;
  const target = { x: 0, y: 0 };
  const lean = { x: 0, y: 0 };

  const pose = () => {
    const sinceEnter = time - enterAt;
    const swing = Number.isFinite(enterAt) ? easeOut(Math.min(Math.max(sinceEnter / ENTER_SECONDS, 0), 1)) : reduceMotion ? 1 : 0;
    const idle = reduceMotion ? 0 : 1;
    phone.rotation.y =
      ENTER_Y + (REST_Y - ENTER_Y) * swing + Math.sin(time * 0.45) * 0.07 * idle + lean.x * LEAN_Y;
    phone.rotation.x = REST_X + Math.sin(time * 0.37) * 0.025 * idle - lean.y * LEAN_X;
    phone.rotation.z = Math.sin(time * 0.31) * 0.012 * idle;
    phone.position.y = Math.sin(time * 0.8) * 0.035 * idle;
  };

  const render = (now: number) => {
    frame = requestAnimationFrame(render);
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    time += dt;
    const follow = 1 - Math.pow(0.001, dt);
    lean.x += (target.x - lean.x) * follow;
    lean.y += (target.y - lean.y) * follow;
    pose();
    renderer.render(scene, camera);
  };

  const renderOnce = () => {
    pose();
    renderer.render(scene, camera);
  };
  renderOnce();

  return {
    setPointer(x, y) {
      if (reduceMotion) return;
      target.x = x;
      target.y = y;
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      if (reduceMotion) {
        if (active) renderOnce();
        return;
      }
      if (active) {
        last = 0;
        frame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frame);
      }
    },
    enter() {
      if (!reduceMotion && !Number.isFinite(enterAt)) enterAt = time;
    },
    dispose() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          const m = o.material as MeshBasicMaterial;
          m.map?.dispose();
          m.dispose();
        }
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

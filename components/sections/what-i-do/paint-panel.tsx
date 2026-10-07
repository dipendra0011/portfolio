"use client";

/*
 * "Graphics" visual: a little Paint window visitors can actually draw in.
 * Classic Windows 98 look (scoped to .paint, so it can't touch the rest of
 * the site), an HTML canvas underneath, and perfect-freehand (MIT, by Steve
 * Ruiz) for the brush's smooth, tapered strokes.
 *
 * Tools: pencil, brush, spray can, eraser, fill bucket, in three sizes.
 * File: New / Save (downloads a PNG) / Pin to the wall (sends it to /wall,
 * where it shows once approved; see lib/wall.ts). Edit: Undo / Redo. Keys while the window
 * has focus (it takes it when you draw): Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or
 * Ctrl+Y redo, P B S E F pick a tool, Esc leaves full screen. The □ button
 * opens it full screen; the drawing carries across.
 *
 * While the window is on screen its title bar is a "watch" perch for the
 * home page's bird (bird-companion.tsx): it lands there and watches, and
 * PAINT_DRAWING_EVENT tells it when someone's drawing so it can bob along.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  EraserIcon,
  PaintBrushIcon,
  PaintBucketIcon,
  PencilSimpleIcon,
  PushPinIcon,
  SprayBottleIcon,
} from "@phosphor-icons/react";
import { getStroke } from "perfect-freehand";
import { getSmoother } from "@/lib/gsap";
import "./paint-panel.css";

type Tool = "pencil" | "brush" | "spray" | "eraser" | "fill";

const TOOLS: { id: Tool; label: string; key: string; Icon: typeof PencilSimpleIcon }[] = [
  { id: "pencil", label: "Pencil", key: "p", Icon: PencilSimpleIcon },
  { id: "brush", label: "Brush", key: "b", Icon: PaintBrushIcon },
  { id: "spray", label: "Airbrush", key: "s", Icon: SprayBottleIcon },
  { id: "eraser", label: "Eraser", key: "e", Icon: EraserIcon },
  { id: "fill", label: "Fill with color", key: "f", Icon: PaintBucketIcon },
];

/* The classic 28-colour Paint palette, top row then bottom row. */
const PALETTE = [
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080",
  "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff",
  "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040",
];

/* Fired on window with detail true when a stroke (or fill) starts, false
   when it ends. The bird companion listens. */
export const PAINT_DRAWING_EVENT = "paint:drawing";
const announce = (drawing: boolean) => window.dispatchEvent(new CustomEvent(PAINT_DRAWING_EVENT, { detail: drawing }));

const PAPER = "#ffffff";
/* The owner's own drawing, on the canvas until a visitor makes their mark. */
const DEFAULT_PICTURE = "/what-i-do/graphics/my-drawing.webp";

/* Pinned drawings are sent at most this wide (px), whatever the screen. */
const PIN_MAX_WIDTH = 1600;
const STATUS_IDLE = "Go on. Nobody's grading this.";
const HISTORY_LIMIT = 20;
/* Base widths in CSS px, and the three sizes as multipliers of them. */
const BASE = { pencil: 2, brush: 9, spray: 14, eraser: 18 };
const SIZES = [
  { label: "Small", scale: 0.6 },
  { label: "Medium", scale: 1 },
  { label: "Large", scale: 1.9 },
];
/* Airbrush: dots per puff, and how often it puffs while held still (ms). */
const SPRAY_DOTS = 18;
const SPRAY_EVERY = 30;

/* perfect-freehand outline points to a closed path. */
function strokePath(points: number[][]) {
  if (!points.length) return null;
  const p = new Path2D();
  p.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    p.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  p.closePath();
  return p;
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/* Scanline flood fill on the canvas's own pixels (device px). */
function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, hex: string) {
  const { width: w, height: h } = ctx.canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const at = (x: number, y: number) => (y * w + x) * 4;
  const start = at(sx, sy);
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const [r, g, b] = hexToRgb(hex);
  if (target[0] === r && target[1] === g && target[2] === b && target[3] === 255) return;
  // A little tolerance so antialiased stroke edges don't leave halos.
  const match = (i: number) =>
    Math.abs(d[i] - target[0]) + Math.abs(d[i + 1] - target[1]) + Math.abs(d[i + 2] - target[2]) + Math.abs(d[i + 3] - target[3]) < 96;
  const stack: [number, number][] = [[sx, sy]];
  while (stack.length) {
    const [x, y0] = stack.pop()!;
    let y = y0;
    while (y >= 0 && match(at(x, y))) y--;
    y++;
    let left = false;
    let right = false;
    while (y < h && match(at(x, y))) {
      const i = at(x, y);
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
      if (x > 0) {
        if (match(at(x - 1, y))) {
          if (!left) stack.push([x - 1, y]);
          left = true;
        } else left = false;
      }
      if (x < w - 1) {
        if (match(at(x + 1, y))) {
          if (!right) stack.push([x + 1, y]);
          right = true;
        } else right = false;
      }
      y++;
    }
  }
  ctx.putImageData(img, 0, 0);
}

const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

const ctxOf = (canvas: HTMLCanvasElement | null) => canvas?.getContext("2d", { willReadFrequently: true }) ?? null;
const imageOf = (canvas: HTMLCanvasElement | null) => {
  const c = ctxOf(canvas);
  return c ? c.getImageData(0, 0, c.canvas.width, c.canvas.height) : null;
};

/* What carries over when the window moves between in-place and full screen:
   the picture, and the size (CSS px) it was drawn at. */
type Snapshot = { url: string; w: number; h: number } | null;

type WindowProps = {
  maximized: boolean;
  onToggleMax: () => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
  drawn: boolean;
  setDrawn: (d: boolean) => void;
  snapshot: MutableRefObject<Snapshot>;
  /** Set by the mounted window: saves its picture into `snapshot`. */
  saveRef: MutableRefObject<() => void>;
  /** Offer the title bar as the bird's watch perch while on screen. */
  perch: boolean;
};

function PaintWindow({
  maximized,
  onToggleMax,
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  drawn,
  setDrawn,
  snapshot,
  saveRef,
  perch,
}: WindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const stroke = useRef<{ points: number[][]; base: ImageData | null } | null>(null);
  const sprayAt = useRef<{ x: number; y: number } | null>(null);
  const sprayTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [menu, setMenu] = useState<"file" | "edit" | null>(null);
  // Still showing the default picture, untouched: it re-fits on resize.
  const pristine = useRef(snapshot.current === null);
  // Pinned since the last change: pinning again would send the same picture.
  const pinned = useRef(false);
  const [status, setStatus] = useState(STATUS_IDLE);
  const [pinning, setPinning] = useState(false);

  const ctx = () => ctxOf(canvasRef.current);
  const snapshotNow = () => imageOf(canvasRef.current);
  const scale = SIZES[size].scale;

  // Size the canvas to its box. Whatever's drawn (or carried over from the
  // other mode) is redrawn at the size it was drawn at, never stretched: a
  // bigger box just gives more paper.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let cssW = 0;
    let cssH = 0;
    const fit = () => {
      const r = dpr();
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h || (w === cssW && h === cssH)) return;
      const prev: Snapshot = cssW ? { url: canvas.toDataURL(), w: cssW, h: cssH } : snapshot.current;
      cssW = w;
      cssH = h;
      canvas.width = Math.round(w * r);
      canvas.height = Math.round(h * r);
      const c = ctxOf(canvas);
      if (!c) return;
      c.fillStyle = PAPER;
      c.fillRect(0, 0, canvas.width, canvas.height);
      if (pristine.current) {
        // The default picture covers the paper, cropped evenly at the sides.
        const img = new Image();
        img.onload = () => {
          if (!pristine.current) return;
          const s = Math.max(canvas.width / img.width, canvas.height / img.height);
          const dw = img.width * s;
          const dh = img.height * s;
          c.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
        };
        img.src = DEFAULT_PICTURE;
      } else if (prev) {
        const img = new Image();
        img.onload = () => c.drawImage(img, 0, 0, prev.w * r, prev.h * r);
        img.src = prev.url;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    // Hand the picture over when switching to/from full screen. Saved on
    // request rather than on unmount, so React's dev double-mount can't
    // overwrite it with a blank canvas.
    saveRef.current = () => {
      if (cssW && !pristine.current) snapshot.current = { url: canvas.toDataURL(), w: cssW, h: cssH };
    };
    return () => ro.disconnect();
  }, [snapshot, saveRef]);

  // Offer the title bar as the bird's perch only while the window is really
  // showing (the accordion clips it shut when another discipline is open).
  useEffect(() => {
    const win = windowRef.current;
    const title = titleRef.current;
    if (!perch || !win || !title) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) title.setAttribute("data-bird-perch", "watch");
        else title.removeAttribute("data-bird-perch");
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(win);
    return () => {
      observer.disconnect();
      title.removeAttribute("data-bird-perch");
      announce(false);
    };
  }, [perch]);

  // Full screen takes focus, so the keys work straight away.
  useEffect(() => {
    if (maximized) windowRef.current?.focus({ preventScroll: true });
  }, [maximized]);

  useEffect(() => () => clearInterval(sprayTimer.current), []);

  const pushUndo = useCallback(() => {
    const img = imageOf(canvasRef.current);
    if (!img) return;
    pristine.current = false;
    pinned.current = false;
    undoStack.current.push(img);
    if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const c = ctxOf(canvasRef.current);
    const last = undoStack.current.pop();
    const now = imageOf(canvasRef.current);
    if (c && last && now) {
      redoStack.current.push(now);
      c.putImageData(last, 0, 0);
    }
    setMenu(null);
  }, []);

  const redo = useCallback(() => {
    const c = ctxOf(canvasRef.current);
    const next = redoStack.current.pop();
    const now = imageOf(canvasRef.current);
    if (c && next && now) {
      undoStack.current.push(now);
      c.putImageData(next, 0, 0);
    }
    setMenu(null);
  }, []);

  const clear = useCallback(() => {
    const c = ctxOf(canvasRef.current);
    if (!c) return;
    pushUndo();
    c.fillStyle = PAPER;
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    setDrawn(false);
    setMenu(null);
  }, [pushUndo, setDrawn]);

  const save = useCallback(() => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "my-drawing.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    setMenu(null);
  }, []);

  const pin = useCallback(async () => {
    setMenu(null);
    const src = canvasRef.current;
    if (!src || pinning) return;
    if (pristine.current || !drawn) return setStatus("Draw something first, then pin it.");
    if (pinned.current) return setStatus("Already pinned. Change something to pin it again.");
    // Sent at screen size, not the canvas's retina size, to keep it light.
    const s = Math.min(1 / dpr(), PIN_MAX_WIDTH / src.width);
    const out = document.createElement("canvas");
    out.width = Math.round(src.width * s);
    out.height = Math.round(src.height * s);
    out.getContext("2d")?.drawImage(src, 0, 0, out.width, out.height);
    const blob = await new Promise<Blob | null>((done) => out.toBlob(done, "image/png"));
    if (!blob) return;
    setPinning(true);
    setStatus("Pinning...");
    try {
      const res = await fetch("/api/wall", { method: "POST", headers: { "content-type": "image/png" }, body: blob });
      if (res.ok) pinned.current = true;
      setStatus(
        res.ok
          ? "Pinned! It goes up on the wall once I've had a look."
          : res.status === 429
            ? "That's a lot of art. Try again in a bit."
            : "Couldn't pin it. Try again?",
      );
    } catch {
      setStatus("Couldn't pin it. Try again?");
    } finally {
      setPinning(false);
    }
  }, [drawn, pinning]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    if (mod && k === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (mod && k === "y") {
      e.preventDefault();
      redo();
    } else if (k === "escape" && maximized) {
      onToggleMax();
    } else if (!mod && !e.altKey) {
      const t = TOOLS.find((x) => x.key === k);
      if (t) setTool(t.id);
    }
  };

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, e.pressure || 0.5];
  };

  const puff = (c: CanvasRenderingContext2D, x: number, y: number) => {
    const r = dpr();
    const radius = BASE.spray * scale;
    c.save();
    c.scale(r, r);
    c.fillStyle = color;
    for (let i = 0; i < SPRAY_DOTS; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * radius;
      c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1, 1);
    }
    c.restore();
  };

  const paint = (c: CanvasRenderingContext2D, points: number[][]) => {
    const r = dpr();
    c.save();
    c.scale(r, r);
    if (tool === "brush") {
      const path = strokePath(getStroke(points, { size: BASE.brush * scale, thinning: 0.6, smoothing: 0.5, streamline: 0.4 }));
      if (path) {
        c.fillStyle = color;
        c.fill(path);
      }
    } else {
      const eraser = tool === "eraser";
      c.strokeStyle = eraser ? PAPER : color;
      c.lineWidth = (eraser ? BASE.eraser : BASE.pencil) * scale;
      c.lineCap = eraser ? "square" : "round";
      c.lineJoin = "round";
      c.beginPath();
      points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      if (points.length === 1) c.lineTo(points[0][0] + 0.01, points[0][1]);
      c.stroke();
    }
    c.restore();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ctx();
    if (!c || e.button > 0) return;
    setMenu(null);
    // Drawing gives the window focus, so Ctrl/Cmd+Z works right after.
    windowRef.current?.focus({ preventScroll: true });
    const p = point(e);
    if (tool === "fill") {
      pushUndo();
      const r = dpr();
      floodFill(c, Math.floor(p[0] * r), Math.floor(p[1] * r), color);
      setDrawn(true);
      // A fill is a single click: give the bird a short burst.
      announce(true);
      setTimeout(() => announce(false), 500);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndo();
    setDrawn(true);
    announce(true);
    if (tool === "spray") {
      sprayAt.current = { x: p[0], y: p[1] };
      puff(c, p[0], p[1]);
      // Held still, the airbrush keeps building up, like the real one.
      sprayTimer.current = setInterval(() => {
        const at = sprayAt.current;
        const cc = ctx();
        if (at && cc) puff(cc, at.x, at.y);
      }, SPRAY_EVERY);
      return;
    }
    // The brush redraws its whole outline each move, over the canvas as it
    // was when the stroke began.
    stroke.current = { points: [p], base: tool === "brush" ? snapshotNow() : null };
    paint(c, [p]);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(e);
    if (coordsRef.current) coordsRef.current.textContent = `${Math.round(p[0])}, ${Math.round(p[1])}px`;
    if (sprayAt.current) {
      sprayAt.current = { x: p[0], y: p[1] };
      return;
    }
    const s = stroke.current;
    const c = ctx();
    if (!s || !c) return;
    s.points.push(p);
    if (s.base) {
      c.putImageData(s.base, 0, 0);
      paint(c, s.points);
    } else {
      paint(c, s.points.slice(-2));
    }
  };

  const onUp = () => {
    if (stroke.current || sprayAt.current) announce(false);
    stroke.current = null;
    sprayAt.current = null;
    clearInterval(sprayTimer.current);
  };

  return (
    <div
      ref={windowRef}
      className={`paint${maximized ? " paint--max" : ""}`}
      role="group"
      aria-label="A little Paint window you can draw in"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div ref={titleRef} className="paint__titlebar">
        <span className="paint__title">
          <span className="paint__app-icon" aria-hidden>
            <PaintBrushIcon weight="fill" />
          </span>
          untitled - Paint
        </span>
        <span className="paint__window-buttons">
          <span aria-hidden>_</span>
          <button
            type="button"
            aria-label={maximized ? "Restore" : "Open full screen"}
            title={maximized ? "Restore (Esc)" : "Full screen"}
            onClick={onToggleMax}
          >
            {maximized ? "❐" : "□"}
          </button>
          {maximized ? (
            <button type="button" aria-label="Close full screen" title="Close (Esc)" onClick={onToggleMax}>
              ×
            </button>
          ) : (
            <span aria-hidden>×</span>
          )}
        </span>
      </div>

      <div className="paint__menubar">
        <div className="paint__menu">
          <button type="button" aria-expanded={menu === "file"} onClick={() => setMenu(menu === "file" ? null : "file")}>
            <u>F</u>ile
          </button>
          {menu === "file" && (
            <div className="paint__dropdown" role="menu">
              <button type="button" role="menuitem" onClick={clear}>
                New
              </button>
              <button type="button" role="menuitem" onClick={save}>
                Save as PNG
              </button>
              <button type="button" role="menuitem" onClick={pin}>
                Pin to the wall
              </button>
            </div>
          )}
        </div>
        <div className="paint__menu">
          <button type="button" aria-expanded={menu === "edit"} onClick={() => setMenu(menu === "edit" ? null : "edit")}>
            <u>E</u>dit
          </button>
          {menu === "edit" && (
            <div className="paint__dropdown" role="menu">
              <button type="button" role="menuitem" onClick={undo}>
                Undo <span className="paint__shortcut">Ctrl+Z</span>
              </button>
              <button type="button" role="menuitem" onClick={redo}>
                Redo <span className="paint__shortcut">Ctrl+Y</span>
              </button>
              <button type="button" role="menuitem" onClick={clear}>
                Clear image
              </button>
            </div>
          )}
        </div>
        {["View", "Image", "Options", "Help"].map((m) => (
          <span key={m} className="paint__menu-static" aria-hidden>
            <u>{m[0]}</u>
            {m.slice(1)}
          </span>
        ))}
        {/* The wall, up top where it's seen: browse it, or send yours. */}
        <div className="paint__wall">
          <Link href="/wall" className="paint__wall-link">
            View wall
          </Link>
          <button
            type="button"
            className="paint__pin"
            onClick={pin}
            disabled={pinning}
            title="Send your drawing to the wall"
          >
            <PushPinIcon weight="duotone" aria-hidden />
            {pinning ? "Pinning..." : "Pin to the wall"}
          </button>
        </div>
      </div>

      <div className="paint__body">
        <div className="paint__side">
          <div className="paint__toolbox" role="toolbar" aria-label="Tools">
            {TOOLS.map(({ id, label, key, Icon }) => (
              <button
                key={id}
                type="button"
                className="paint__tool"
                aria-pressed={tool === id}
                aria-label={label}
                title={`${label} (${key.toUpperCase()})`}
                onClick={() => setTool(id)}
              >
                <Icon weight="duotone" />
              </button>
            ))}
            <button type="button" className="paint__tool" aria-label="Undo" title="Undo (Ctrl+Z)" onClick={undo}>
              <ArrowUUpLeftIcon weight="bold" />
            </button>
            <button type="button" className="paint__tool" aria-label="Redo" title="Redo (Ctrl+Y)" onClick={redo}>
              <ArrowUUpRightIcon weight="bold" />
            </button>
          </div>

          {tool !== "fill" && (
            <div className="paint__sizes" role="radiogroup" aria-label="Size">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={size === i}
                  aria-label={`${s.label} size`}
                  className="paint__size"
                  onClick={() => setSize(i)}
                >
                  <span style={{ height: `${1 + i * 2}px` }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="paint__canvas-well">
          <div ref={wrapRef} className="paint__canvas-wrap">
            <canvas
              ref={canvasRef}
              className={`paint__canvas paint__canvas--${tool}`}
              aria-label="Drawing canvas"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onPointerLeave={() => coordsRef.current && (coordsRef.current.textContent = "")}
            />
            <p className={`paint__prompt${drawn ? " is-gone" : ""}`} aria-hidden={drawn}>
              When did you last draw something just for fun?
            </p>
          </div>
        </div>
      </div>

      <div className="paint__palette">
        <span className="paint__current" aria-hidden>
          <span style={{ background: color }} />
        </span>
        <div className="paint__swatches" role="radiogroup" aria-label="Colours">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              className="paint__swatch"
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="paint__statusbar">
        <span aria-live="polite">{status}</span>
        <span ref={coordsRef} className="paint__coords" />
      </div>
    </div>
  );
}

export function PaintPanel() {
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(1);
  // Starts true: the default picture is already on the canvas, so the
  // prompt waits until someone clears it.
  const [drawn, setDrawn] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const snapshot = useRef<Snapshot>(null);
  const saveRef = useRef<() => void>(() => {});
  const toggleMax = useCallback(() => {
    saveRef.current();
    setMaximized((m) => !m);
  }, []);

  // Full screen: the page behind stops scrolling until it's closed.
  useEffect(() => {
    if (!maximized) return;
    const smoother = getSmoother();
    smoother?.paused(true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      smoother?.paused(false);
      document.body.style.overflow = overflow;
    };
  }, [maximized]);

  const shared = { onToggleMax: toggleMax, tool, setTool, color, setColor, size, setSize, drawn, setDrawn, snapshot, saveRef };

  return (
    <div className="paint-stage">
      {maximized ? (
        <>
          {/* Left in place while it's open full screen. */}
          <div className="paint-stage__away">
            <span>Paint is open full screen</span>
            <button type="button" onClick={toggleMax}>
              Bring it back
            </button>
          </div>
          {createPortal(
            <div className="paint-overlay">
              <div className="paint-overlay__backdrop" onClick={toggleMax} aria-hidden />
              <PaintWindow maximized perch={false} {...shared} />
            </div>,
            document.body,
          )}
        </>
      ) : (
        <PaintWindow maximized={false} perch {...shared} />
      )}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { hasIntroPlayed } from "@/components/sections/hero-intro";
import "./bird-companion.css";

/* The crayon bird that keeps you company down the home page.
 *
 * Perches are marked in the markup with `data-bird-perch`:
 *   - "spot"  the bird fills that element's box (the hero's slot)
 *   - "end"   it sits on the end of the element's last line of text
 *   - "home"  it flies into that element and fades out, handing off to the
 *             footer's own bird so two never show at once
 *
 * Each frame it eases toward the perch nearest the reading line, so scrolling
 * makes it fly along and swoop to the next section. While perched it leans a
 * little toward the cursor, and shies away if the cursor comes close, so it
 * never sits under the pointer. It ignores pointer events entirely.
 *
 * Left alone long enough it lands somewhere to rest: on the top edge of an
 * image, card or outlined box that's on screen and clear of text, where it
 * pecks away (the footer's bird.gif) for PECK_FOR seconds, then takes off and
 * flies about again. Scrolling or reaching for it also sends it off.
 *
 * "watch" perches beat all others: the Graphics Paint window offers its title
 * bar while it's on screen, and the bird sits up there watching the cursor,
 * bobbing its head along (pecking) whenever someone draws.
 */

const READING_LINE = 0.45; // fraction of the viewport height
const MAX_SPEED = 480; // px/s; it never outruns a quick scroll, it catches up
const MAX_ACCEL = 700; // px/s²; caps how sharply it can turn or brake
const ARRIVE = 2; // 1/s; how eagerly it closes the last stretch to a perch
const BOB = 4; // px of idle bob while perched
const ROAM_AFTER = 7; // s without scrolling before it gets restless
const ROAM_SPEED = 0.45; // fraction of MAX_SPEED while wandering
const ROAM_LEG = [2.5, 5]; // s spent heading for each wander spot
const ROAM_REST = 0.3; // chance a leg is a rest back on the perch
const REST_AFTER = 10; // s without scrolling before it lands somewhere to rest
const REST_RETRY = 2; // s between searches when nowhere good is on screen
const REST_INSET = 16; // px kept from a resting edge's corners
const REST_FOOT = 3; // px its feet sink onto the edge it stands on
const PECK_FOR = 10; // s it pecks away on its edge before taking off again
const REST_MEDIA = new Set(["IMG", "VIDEO", "CANVAS", "PICTURE"]);
const LEAN_MAX = 10; // px toward the cursor while perched
const SHY_RADIUS = 110; // px; inside this the bird backs off from the cursor
const SHY_PUSH = 46; // px at the closest distance
const PITCH_MAX = 22; // degrees the nose tips up or down along its path
const TURN_RATE = 10; // facing units per second; 2 units is a full turn
const FACE_SPEED = 12; // px/s sideways that decides which way it faces
const STILL_SPEED = 10; // px/s below which it counts as sitting still
const CLIMB_SPEED = 90; // px/s upward above which it flaps hard
const GLIDE_SPEED = 70; // px/s downward above which it glides
const FLYING_SPEED = 120; // px/s above which it counts as flying
const HOME_FADE_DISTANCE = 60; // px from home where it starts fading out
const LANDED_DISTANCE = 14; // px from home that counts as landed
const EDGE = 16; // px kept from the viewport edges
const HEADER_CLEARANCE = 64; // px kept clear under the fixed header
const RELEASE_EVENT = "bird:release";
/* Matches PAINT_DRAWING_EVENT in paint-panel.tsx (kept as a string so the bird
   doesn't import the paint panel). */
const PAINT_DRAWING_EVENT = "paint:drawing";
const WATCH_AT = 0.7; // how far along a watch perch it sits: the gap between the copy and the tool chips above
const PECK_LINGER = 0.6; // s it keeps bobbing after the pen lifts
export const BIRD_RELEASE_EVENT = RELEASE_EVENT;

type Perch = { el: HTMLElement; mode: string };
type Box = { left: number; top: number; right: number; bottom: number };

const TEXT_PADDING = 18; // px of clear air kept around any text

/* Elements that directly hold visible text, refreshed now and then because
   SplitText swaps text nodes for spans after load. */
let textHolders: HTMLElement[] = [];
let textHoldersAt = -Infinity;

function visibleTextRects(vh: number): Box[] {
  const now = performance.now();
  if (now - textHoldersAt > 1000) {
    textHoldersAt = now;
    const set = new Set<HTMLElement>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const parent = n.parentElement;
      if (parent && n.textContent!.trim() && !parent.closest(".bird-companion, script, style, .sr-only")) set.add(parent);
    }
    textHolders = [...set];
  }
  const range = document.createRange();
  const boxes: Box[] = [];
  for (const el of textHolders) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -TEXT_PADDING || r.top > vh + TEXT_PADDING || r.width === 0) continue;
    range.selectNodeContents(el);
    for (const line of range.getClientRects()) {
      if (line.width > 0 && line.height > 0) boxes.push(line);
    }
  }
  return boxes;
}

function overlaps(x: number, y: number, w: number, h: number, boxes: Box[]) {
  for (const b of boxes) {
    if (x < b.right + TEXT_PADDING && x + w > b.left - TEXT_PADDING && y < b.bottom + TEXT_PADDING && y + h > b.top - TEXT_PADDING) return true;
  }
  return false;
}

/* The wanted spot if it's clear of text, otherwise the nearest clear one on
   rings around it. Upward and outward candidates come first at each ring. */
function clearSpot(x: number, y: number, w: number, h: number, boxes: Box[]) {
  if (!overlaps(x, y, w, h, boxes)) return { x, y };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const step = Math.max(w, h) * 0.4;
  for (let ring = 1; ring <= 12; ring++) {
    for (let i = 0; i < 16; i++) {
      const angle = -Math.PI / 2 + (i % 2 ? -1 : 1) * Math.ceil(i / 2) * (Math.PI / 8);
      const cx = gsap.utils.clamp(EDGE, vw - w - EDGE, x + Math.cos(angle) * step * ring);
      const cy = gsap.utils.clamp(EDGE + HEADER_CLEARANCE, vh - h - EDGE, y + Math.sin(angle) * step * ring);
      if (!overlaps(cx, cy, w, h, boxes)) return { x: cx, y: cy };
    }
  }
  return { x, y };
}

/* Things it can stand on: media, anything opted in with data-bird-rest, and
   boxes with a visible top border or background image (cards, outlines).
   Rebuilt at most once a second, like the text holders. */
let restables: HTMLElement[] = [];
let restablesAt = -Infinity;

function restableElements() {
  const now = performance.now();
  if (now - restablesAt < 1000) return restables;
  restablesAt = now;
  restables = [];
  for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
    if (el.closest("header, .bird-companion, [data-bird-perch], script, style")) continue;
    if (REST_MEDIA.has(el.tagName) || el.hasAttribute("data-bird-rest")) {
      restables.push(el);
      continue;
    }
    const cs = getComputedStyle(el);
    const border = parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== "none" && !cs.borderTopColor.endsWith(", 0)");
    if (border || cs.backgroundImage !== "none") restables.push(el);
  }
  return restables;
}

type Rest = { el: HTMLElement; dx: number };

/* The nearest top edge on screen it can stand on without covering text or
   ducking under something else. */
function findRest(cx: number, cy: number, w: number, h: number): Rest | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const boxes = visibleTextRects(vh);
  let best: Rest | null = null;
  let bestDist = Infinity;
  for (const el of restableElements()) {
    const r = el.getBoundingClientRect();
    if (r.width < w * 1.6 || r.height < h * 0.6) continue;
    const y = r.top - h + REST_FOOT;
    if (y < EDGE + HEADER_CLEARANCE || y > vh - h - EDGE) continue;
    for (const dx of [r.width - w - REST_INSET, REST_INSET, (r.width - w) / 2]) {
      const x = r.left + dx;
      if (x < EDGE || x > vw - w - EDGE) continue;
      if (overlaps(x, y, w, h, boxes)) continue;
      // The edge must actually be visible there, not under an overlay.
      const hit = document.elementFromPoint(x + w / 2, r.top + 2);
      if (!hit || !el.contains(hit)) continue;
      const d = Math.hypot(x + w / 2 - cx, y + h / 2 - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { el, dx };
      }
    }
  }
  return best;
}

function perchTarget({ el, mode }: Perch, w: number, h: number) {
  if (mode === "end") {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = range.getClientRects();
    const last = rects[rects.length - 1] ?? el.getBoundingClientRect();
    // Beside the last line, past its final letter with some air.
    return { x: last.right + TEXT_PADDING + 8, y: last.top + (last.height - h) / 2 };
  }
  const r = el.getBoundingClientRect();
  // Standing on top of it, about two-thirds along.
  if (mode === "watch") return { x: r.left + r.width * WATCH_AT - w / 2, y: r.top - h + REST_FOOT };
  if (mode === "home") return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2 };
  return { x: r.left + (r.width - w) / 2, y: r.bottom - h };
}

export function BirdCompanion() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const bird = rootRef.current!;
      const sprite = bird.firstElementChild as HTMLElement;
      const slot = document.querySelector<HTMLElement>('[data-bird-perch="spot"]');

      let w = 96;
      let h = (w * 314) / 370;
      const measure = () => {
        w = slot?.offsetWidth || 96;
        h = (w * 314) / 370;
        bird.style.width = `${w}px`;
        bird.style.height = `${h}px`;
      };
      measure();

      // Starts off-screen, up and to the right, until the hero lets it go.
      let x = window.innerWidth + w;
      let y = -h * 2;
      let vx = 0;
      let vy = 0;
      let rot = 0;
      let time = 0;
      // Restlessness: no scrolling for a while and it wanders the screen.
      let lastScroll = window.scrollY;
      let stillSince = 0;
      let roam: { x: number; y: number; until: number; rest: boolean } | null = null;
      let rest: Rest | null = null;
      let nextRestTry = 0;
      // When the current peck session ends.
      let wasLanded = false;
      let peckUntil = 0;
      let facing = -1; // -1 faces left (towards the hero headline)
      let turn = -1; // eases towards facing; drives the sprite's flip
      // Back on Home after the intro already played this page load: it's
      // simply there on its perch, no fly-in.
      let released = hasIntroPlayed();
      let snap = released;
      let mouseX = -1e4;
      let mouseY = -1e4;
      // Someone is drawing in the Paint window (and a beat after they stop).
      let drawing = false;
      let drawingUntil = 0;

      const setX = gsap.quickSetter(bird, "x", "px");
      const setY = gsap.quickSetter(bird, "y", "px");
      const setRot = gsap.quickSetter(bird, "rotation", "deg");
      const setAlpha = gsap.quickSetter(bird, "opacity");
      // Parked off-screen and hidden until the hero releases it.
      setX(x);
      setY(y);
      setAlpha(0);

      const onMove = (e: PointerEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };
      const onRelease = () => {
        released = true;
      };
      const onDrawing = (e: Event) => {
        drawing = (e as CustomEvent<boolean>).detail;
        if (!drawing) drawingUntil = time + PECK_LINGER;
      };
      // The footer bird stays away until this one lands there.
      const homes = Array.from(document.querySelectorAll<HTMLElement>('[data-bird-perch="home"]'));
      for (const home of homes) home.setAttribute("data-bird-away", "");

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("resize", measure);
      window.addEventListener(RELEASE_EVENT, onRelease);
      window.addEventListener(PAINT_DRAWING_EVENT, onDrawing);

      const tick = (_t: number, deltaMs: number) => {
        if (!released) return;
        const dt = Math.min(deltaMs, 64) / 1000;
        if (dt <= 0) return;
        const vh = window.innerHeight;

        // A watch perch (the Paint window, while it's showing) wins outright;
        // otherwise the perch nearest the reading line does.
        const watchEl = document.querySelector<HTMLElement>('[data-bird-perch="watch"]');
        const perches = watchEl
          ? []
          : Array.from(document.querySelectorAll<HTMLElement>("[data-bird-perch]"), (el) => ({ el, mode: el.dataset.birdPerch! }));
        let best: Perch | null = watchEl ? { el: watchEl, mode: "watch" } : null;
        let bestDist = Infinity;
        for (const p of perches) {
          const r = p.el.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - vh * READING_LINE);
          if (d < bestDist) {
            bestDist = d;
            best = p;
          }
        }
        if (!best) return;

        let { x: tx, y: ty } = perchTarget(best, w, h);

        if (Math.abs(window.scrollY - lastScroll) > 1) {
          lastScroll = window.scrollY;
          stillSince = time;
          roam = null;
        }
        // Long enough without scrolling: find somewhere to land and rest.
        const watching = best.mode === "watch";
        if (watching || best.mode === "home" || time - stillSince <= REST_AFTER) {
          rest = null;
          nextRestTry = 0;
        } else if (!rest && time >= nextRestTry) {
          rest = findRest(x + w / 2, y + h / 2, w, h);
          if (!rest) nextRestTry = time + REST_RETRY;
        }
        if (rest) {
          const r = rest.el.getBoundingClientRect();
          tx = r.left + rest.dx;
          ty = r.top - h + REST_FOOT;
          // Its spot moved or vanished (layout change): look again later.
          if (r.width === 0 || ty < EDGE + HEADER_CLEARANCE || ty > vh - h - EDGE) {
            rest = null;
            nextRestTry = time + REST_RETRY;
          }
        }

        const roaming = !rest && !watching && best.mode !== "home" && time - stillSince > ROAM_AFTER;
        if (!roaming) roam = null;
        else {
          if (!roam || time > roam.until) {
            const rest = Math.random() < ROAM_REST;
            const spot = clearSpot(
              EDGE + Math.random() * (window.innerWidth - w - EDGE * 2),
              EDGE + HEADER_CLEARANCE + Math.random() * (vh - h - EDGE * 2 - HEADER_CLEARANCE),
              w,
              h,
              visibleTextRects(vh),
            );
            roam = { ...spot, rest, until: time + gsap.utils.random(ROAM_LEG[0], ROAM_LEG[1]) };
          }
          if (!roam.rest) {
            tx = roam.x;
            ty = roam.y;
          }
        }
        const cx = tx + w / 2;
        const cy = ty + h / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.hypot(dx, dy) || 1;

        // Reaching for it while it rests makes it take off.
        if (rest && dist < SHY_RADIUS) {
          rest = null;
          stillSince = time;
        }

        if (rest || watching) {
          // Standing on its edge: no shying, leaning or text dodging.
        } else if (best.mode !== "home") {
          // Back off when the cursor gets close.
          if (dist < SHY_RADIUS) {
            const push = SHY_PUSH * (1 - dist / SHY_RADIUS);
            tx -= (dx / dist) * push;
            ty -= (dy / dist) * push;
          }
          // Between perches far apart, wait at the screen edge nearest the
          // perch instead of following it out of view.
          tx = gsap.utils.clamp(EDGE, window.innerWidth - w - EDGE, tx);
          ty = gsap.utils.clamp(EDGE + HEADER_CLEARANCE, vh - h - EDGE, ty);
          // Never settle over text: take the nearest clear spot. The hero's
          // slot is reserved space in the line itself, so it's exempt.
          if (best.mode !== "spot") ({ x: tx, y: ty } = clearSpot(tx, ty, w, h, visibleTextRects(vh)));
          // A small lean toward the cursor, inside the text padding.
          const lean = Math.min(LEAN_MAX, dist * 0.02);
          tx += (dx / dist) * lean;
          ty += (dy / dist) * lean;
        }

        if (best.mode !== "home" && !rest && !watching) ty += Math.sin(time * 2.4) * BOB;
        time += dt;

        // Steer like something with a top speed: aim for a velocity that
        // points at the target, then turn towards it with limited force.
        // Fast scrolling leaves it behind; it catches up in its own time.
        const ex = tx - x;
        const ey = ty - y;
        const gap = Math.hypot(ex, ey) || 1;
        const want = Math.min(MAX_SPEED * (roam && !roam.rest ? ROAM_SPEED : 1), gap * ARRIVE);
        let ax = ((ex / gap) * want - vx) / dt;
        let ay = ((ey / gap) * want - vy) / dt;
        const a = Math.hypot(ax, ay);
        if (a > MAX_ACCEL) {
          ax *= MAX_ACCEL / a;
          ay *= MAX_ACCEL / a;
        }

        // It can't fly backwards. A target behind it means braking to a stop
        // (full strength), turning round, then flying off the other way.
        // While the sprite is mid-turn it can't push forward yet.
        const turning = Math.abs(turn - facing) > 0.3;
        if (turning && ax * facing > 0) ax *= 0.2;
        // Climbing is work; dropping is free.
        if (ay < 0) ay *= 0.75;

        vx += ax * dt;
        vy += ay * dt;
        if (snap) {
          snap = false;
          x = tx;
          y = ty;
          vx = vy = 0;
        }
        x += vx * dt;
        y += vy * dt;
        // Touchdown: settle exactly on the edge instead of hovering over it.
        const close = Math.hypot(tx - x, ty - y) < LANDED_DISTANCE;
        const landed = rest !== null && close;
        const sittingWatch = watching && close;
        if (landed || sittingWatch) {
          x = tx;
          y = ty;
          vx = vy = 0;
        }
        bird.classList.toggle("is-resting", landed);
        // On the Paint window: sits up and watches, bobs along while drawing.
        bird.classList.toggle("is-watching", sittingWatch);
        bird.classList.toggle("is-pecking", sittingWatch && (drawing || time < drawingUntil));
        if (landed && !wasLanded) peckUntil = time + PECK_FOR;
        wasLanded = landed;
        // Done pecking: back in the air. Restarting the stillness clock means
        // it roams for a while, then finds another place to rest.
        if (landed && time > peckUntil) {
          rest = null;
          stillSince = time;
        }
        const speed = Math.hypot(vx, vy);

        // Face the way it's actually moving, so it's never tail-first. Only
        // when it's sitting still does it turn to watch the cursor.
        if (Math.abs(vx) > FACE_SPEED) facing = Math.sign(vx);
        else if (speed < STILL_SPEED && dist < 600 && Math.abs(dx) > 60) facing = Math.sign(dx);
        // The turn itself: the sprite narrows through edge-on and flips over
        // about a fifth of a second, instead of snapping.
        turn += gsap.utils.clamp(-dt * TURN_RATE, dt * TURN_RATE, facing - turn);

        // Flaps hard to climb, beats steady in level flight, holds its wings
        // out to glide down, and hovers gently when perched.
        const climbing = vy < -CLIMB_SPEED;
        const gliding = vy > GLIDE_SPEED && !climbing;
        bird.classList.toggle("is-climbing", climbing);
        bird.classList.toggle("is-gliding", gliding);
        bird.classList.toggle("is-flying", !climbing && !gliding && speed > FLYING_SPEED);

        // The art faces right, so +1 is unmirrored.
        sprite.style.transform = `scaleX(${Math.abs(turn) < 0.08 ? 0.08 * Math.sign(turn || 1) : turn})`;
        setX(x);
        setY(y);
        // Nose follows the flight path: up when climbing, down when diving.
        // Mirrored when facing left so "nose up" stays nose up.
        const pitch = gsap.utils.clamp(-PITCH_MAX, PITCH_MAX, Math.atan2(vy, Math.abs(vx) + 80) * (180 / Math.PI));
        rot += (pitch * facing - rot) * Math.min(1, dt * 5);
        setRot(rot);

        // Landing at home: the footer's bird appears as this one fades out.
        const toHome = best.mode === "home" ? Math.hypot(tx - x, ty - y) : Infinity;
        setAlpha(gsap.utils.clamp(0, 1, toHome / HOME_FADE_DISTANCE));
        for (const home of homes) home.classList.toggle("is-home", home === best.el && toHome < LANDED_DISTANCE * 4 && (home.classList.contains("is-home") || toHome < LANDED_DISTANCE));
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        for (const home of homes) {
          home.removeAttribute("data-bird-away");
          home.classList.remove("is-home");
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", measure);
        window.removeEventListener(RELEASE_EVENT, onRelease);
        window.removeEventListener(PAINT_DRAWING_EVENT, onDrawing);
      };
    });
  });

  return (
    <div ref={rootRef} className="bird-companion" aria-hidden="true">
      <span className="bird-companion__sprite" />
    </div>
  );
}

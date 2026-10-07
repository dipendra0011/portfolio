/* Lets a page hold the project cards' entrance (WebGL unmask/zoom/slide, title
   roll, index typewriter) until it's ready to show them, then deal them in.
   The Work page holds them under its title: put HOLD_ATTR on an ancestor of
   the grid, then remove it and dispatch RELEASE_EVENT. Without the attribute
   cards enter on scroll exactly as before. */

export const HOLD_ATTR = "data-hold-entrance";
export const RELEASE_EVENT = "projects:release";
/* Seconds between consecutive cards as they're dealt in on release. */
export const DEAL_STAGGER = 0.14;

export const isHeld = (el: Element) => el.closest(`[${HOLD_ATTR}]`) !== null;

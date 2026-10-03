/* The hero's crayon intro plays once per page load. A module variable is
   exactly that lifetime: it survives client-side navigation (leave Home and
   come back through the nav, no replay) and resets on a full reload. Browser
   storage would outlive the reload, which isn't wanted. */
let introPlayed = false;

export const hasIntroPlayed = () => introPlayed;

export function markIntroPlayed() {
  introPlayed = true;
}

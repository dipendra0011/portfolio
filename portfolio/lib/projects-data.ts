/**
 * Shared project data for the v2 site.
 *
 * Deliberately NOT a "use client" module: the static-export route at
 * app/work/[slug]/page.tsx is a server component (generateStaticParams
 * can't live in a client file) and imports this, while components/v2/projects.tsx
 * imports the same array on the client. One source of truth for both.
 */

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  /** Route param. `href` alone can't serve as one. */
  slug: string;
  title: string;
  /** Shown on the grid card and reused as the detail page's Services list. */
  tags: string[];
  /** Trailing slash is required — next.config.ts sets `trailingSlash: true`. */
  href: string;
  /** Grid thumbnail. Root-relative: a relative path would resolve wrong at
   *  the /work/<slug>/ depth. */
  image: string;
  /** Detail page hero. Same asset as `image` until real art exists. */
  heroImage: string;
  /** Detail page body copy, one entry per paragraph. */
  description: string[];
  links?: ProjectLink[];
};

// Placeholder titles/copy — real project content still TBD. Images are the
// existing mockups from public/images/figma; the old v2 placeholder was a
// near-black frame, which made the card distortion effect invisible.
export const PROJECTS: Project[] = [
  {
    slug: "neptunes",
    title: "Building loyalty, made tangible.",
    tags: ["Concept", "Web", "Design", "Development"],
    href: "/work/neptunes/",
    image: "/images/figma/project-a.png",
    heroImage: "/images/figma/project-a.png",
    description: [
      "A loyalty programme that people could actually hold. The brief was to take a points scheme buried three taps deep in an app and give it a surface — something a member could see, earn against, and show off without opening anything.",
      "We rebuilt the earning model around visible milestones, then designed the interface so progress was never more than a glance away. The result reads less like an account balance and more like a collection.",
    ],
    links: [
      { label: "Live site", url: "#" },
      { label: "Case study deck", url: "#" },
    ],
  },
  {
    slug: "service-booking",
    title: "Turning bookings into a service you trust.",
    tags: ["Concept", "Web", "Design", "Development"],
    href: "/work/service-booking/",
    image: "/images/figma/project-b.png",
    heroImage: "/images/figma/project-b.png",
    description: [
      "Booking flows fail in the gap between picking a time and believing it happened. This one was losing people at exactly that seam — confirmations arrived late, changes felt risky, and support absorbed the difference.",
      "We reworked the flow around a single running record of the appointment: one place that updates, one place to change it, one place that tells you where things stand. Support volume followed.",
    ],
    links: [{ label: "Live site", url: "#" }],
  },
  {
    slug: "onboarding",
    title: "Making onboarding feel effortless.",
    tags: ["Product", "Web", "Design"],
    href: "/work/onboarding/",
    image: "/images/figma/project-c.png",
    heroImage: "/images/figma/project-c.png",
    description: [
      "Every field you ask for on day one is a reason to leave. We cut the first-run experience down to what genuinely could not wait, and moved the rest to the moments where it actually earns its place.",
      "What's left is a sign-up that explains itself as it goes, defers anything optional, and never asks twice for something it already knows.",
    ],
  },
  {
    slug: "campaigns",
    title: "Campaigns built to be remembered.",
    tags: ["Graphics", "Brand", "Art Direction"],
    href: "/work/campaigns/",
    image: "/images/figma/gallery.jpg",
    heroImage: "/images/figma/gallery.jpg",
    description: [
      "A campaign system rather than a campaign: a set of typographic and colour rules loose enough to survive contact with a dozen formats, tight enough that all of them still read as one voice.",
      "Print, outdoor, and social were designed together from the start, so nothing had to be retrofitted into a format it was never drawn for.",
    ],
    links: [{ label: "Selected work", url: "#" }],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

/** Wraps around, so the last project's teaser points back at the first. */
export function getNextProject(slug: string): Project {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}

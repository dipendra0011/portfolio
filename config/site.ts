import { PROJECTS } from "@/config/projects";

export type NavItem = {
  label: string;
  href: string;
  /** Optional superscript count, e.g. number of projects. */
  count?: number;
  /** Page isn't built yet: rendered as a non-link with a "Coming soon" hint. */
  soon?: boolean;
};

export const siteConfig = {
  name: "Dipendra Shrestha",
  handle: "©DipendraShrest",
  description: "Dipendra Shrestha is a product designer in Kathmandu. Dashboards, tools and design systems for startups and scale-ups.",
  avatar: "/profile-avatar.png",
  nav: [
    { label: "Work", href: "/work", count: PROJECTS.length },
    // { label: "Playground", href: "/playground", soon: true }, // hidden for now
    { label: "About", href: "/about" },
    { label: "Wall", href: "/wall" },
  ] satisfies NavItem[],
  contact: { label: "Get in touch", href: "/contact" },
} as const;

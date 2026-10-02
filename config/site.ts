import { PROJECTS } from "@/config/projects";

export type NavItem = {
  label: string;
  href: string;
  /** Optional superscript count, e.g. number of projects. */
  count?: number;
};

export const siteConfig = {
  name: "Dipendra Shrestha",
  handle: "©DipendraShrest",
  description: "Portfolio of Dipendra Shrestha",
  avatar: "/profile-avatar.png",
  nav: [
    { label: "Work", href: "/work", count: PROJECTS.length },
    { label: "Playground", href: "/playground", count: 16 },
    { label: "About", href: "/about" },
  ] satisfies NavItem[],
  contact: { label: "Get in touch", href: "/contact" },
} as const;

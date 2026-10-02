export type Project = {
  title: string;
  image: string;
  /** Optional greyscale depth map (white = near) for the hover parallax. */
  depthImage?: string;
  /** Case-study route. Cards without one aren't clickable yet. */
  href?: string;
  /** Still being built — gets the "under construction" hover. */
  wip?: boolean;
};

/** Every project, in display order. The Work page, the home page's
 *  "Selected works" and the nav's Work count all read from here. */
export const PROJECTS: Project[] = [
  {
    title: "Paubha",
    image: "/projects/project-a.webp",
    depthImage: "/projects/project-a-depth.png",
    href: "/work/paubha-design-system",
  },
  {
    title: "Ledgerline",
    wip: true,
    image: "/projects/project-b.webp",
    depthImage: "/projects/project-b-depth.png",
  },
  {
    title: "Fieldnote",
    wip: true,
    image: "/projects/project-c.webp",
    depthImage: "/projects/project-c-depth.png",
  },
  {
    title: "Atlas Agent",
    wip: true,
    image: "/projects/gallery.webp",
    depthImage: "/projects/gallery-depth.png",
  },
];

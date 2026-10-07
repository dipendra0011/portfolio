import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { WorkHero } from "@/components/sections/projects/work-hero";
import { WallGallery } from "@/components/sections/wall/wall-gallery";
import { APPROVED, listDrawings } from "@/lib/wall";
import "./wall.css";

export const metadata: Metadata = {
  title: "Wall — Dipendra Shrestha",
  description: "Drawings people made in the little Paint window on this site.",
};

/* New approvals show straight away (the review actions revalidate this
   page); otherwise it refreshes at most once a minute. */
export const revalidate = 60;

const DEV_SAMPLES = [1, 2, 3, 4].map((n) => ({
  url: `/what-i-do/graphics/my-drawing.webp?sample=${n}`,
  pathname: `sample-${n}`,
  uploadedAt: new Date(2026, 9, n),
}));

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function WallPage() {
  const drawings = await listDrawings(APPROVED);
  // Local dev with no Blob store connected: a few samples, so the wall and
  // its viewer can be tried out. Never in production.
  if (!drawings.length && process.env.NODE_ENV === "development") drawings.push(...DEV_SAMPLES);

  return (
    <SmoothScroll>
      <main id="main">
        <WorkHero title="Wall" count={drawings.length} unit="drawings" />
        <div className="work-grid wall" data-hold-entrance>
          <div className="wall__intro">
            <p>
              Drawings people made in the Paint window on the home page. Every one of them was made by someone who
              stopped scrolling for a minute.
            </p>
            <Link href="/#what-i-do" className="wall__cta">
              Add yours
            </Link>
          </div>

          {drawings.length ? (
            <WallGallery
              drawings={drawings.map((d) => ({ url: d.url, pathname: d.pathname, date: dateFormat.format(d.uploadedAt) }))}
            />
          ) : (
            <p className="wall__empty">Nothing up yet. The first spot on the wall is yours.</p>
          )}
        </div>
      </main>
    </SmoothScroll>
  );
}

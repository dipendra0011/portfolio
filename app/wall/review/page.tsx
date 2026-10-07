import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APPROVED, isAdmin, listDrawings, PENDING, type Drawing } from "@/lib/wall";
import { approve, remove } from "./actions";
import "../wall.css";

export const metadata: Metadata = {
  title: "Review the wall",
  robots: { index: false, follow: false },
};

/* Private: open it as /wall/review?key=<WALL_ADMIN_KEY>. Anyone without the
   key gets a plain 404. */
export default async function WallReviewPage({ searchParams }: PageProps<"/wall/review">) {
  const { key } = await searchParams;
  if (!isAdmin(key)) notFound();

  const [pending, approved] = await Promise.all([listDrawings(PENDING), listDrawings(APPROVED)]);

  const card = (d: Drawing, canApprove: boolean) => (
    <li key={d.pathname} className="wall__item">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.url} alt="" loading="lazy" />
        <figcaption>{d.uploadedAt.toLocaleString("en-GB")}</figcaption>
      </figure>
      <form className="wall-review__actions">
        <input type="hidden" name="key" value={key as string} />
        <input type="hidden" name="pathname" value={d.pathname} />
        {canApprove && (
          <button type="submit" formAction={approve} data-primary>
            Approve
          </button>
        )}
        <button type="submit" formAction={remove}>
          {canApprove ? "Reject" : "Take down"}
        </button>
      </form>
    </li>
  );

  return (
    <main id="main" className="wall-review">
      <h1>Review the wall</h1>
      <p className="wall-review__note">Approved drawings show on /wall. Rejected ones are deleted.</p>

      <h2>Waiting ({pending.length})</h2>
      {pending.length ? (
        <ul className="wall__grid">{pending.map((d) => card(d, true))}</ul>
      ) : (
        <p className="wall-review__note">Nothing waiting.</p>
      )}

      <h2>On the wall ({approved.length})</h2>
      {approved.length ? (
        <ul className="wall__grid">{approved.map((d) => card(d, false))}</ul>
      ) : (
        <p className="wall-review__note">Nothing approved yet.</p>
      )}
    </main>
  );
}

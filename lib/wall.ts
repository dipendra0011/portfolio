/*
 * The drawing wall: drawings visitors pin from the home page's Paint window,
 * stored as PNGs in Vercel Blob. New ones land in PENDING and only show on
 * /wall once they're approved (moved to APPROVED) on /wall/review.
 *
 * Needs a Blob store connected to the Vercel project (BLOB_READ_WRITE_TOKEN),
 * and WALL_ADMIN_KEY set for the review page.
 */

import { list } from "@vercel/blob";

export const PENDING = "wall/pending/";
export const APPROVED = "wall/approved/";

export type Drawing = { url: string; pathname: string; uploadedAt: Date };

/** Newest first. Empty (rather than an error) when no store is connected. */
export async function listDrawings(prefix: string, limit = 200): Promise<Drawing[]> {
  try {
    const { blobs } = await list({ prefix, limit });
    return blobs
      .map(({ url, pathname, uploadedAt }) => ({ url, pathname, uploadedAt: new Date(uploadedAt) }))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch {
    return [];
  }
}

/** True only when WALL_ADMIN_KEY is set and matches. */
export const isAdmin = (key: unknown) =>
  typeof key === "string" && Boolean(process.env.WALL_ADMIN_KEY) && key === process.env.WALL_ADMIN_KEY;

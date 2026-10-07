"use server";

import { del, rename } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { APPROVED, isAdmin, PENDING } from "@/lib/wall";

/* Both take the admin key and the drawing's pathname from the review form,
   and only ever touch drawings under wall/. */

export async function approve(form: FormData) {
  const pathname = form.get("pathname");
  if (!isAdmin(form.get("key")) || typeof pathname !== "string" || !pathname.startsWith(PENDING)) return;
  await rename(pathname, APPROVED + pathname.slice(PENDING.length), {
    access: "public",
    contentType: "image/png",
  });
  revalidatePath("/wall");
  revalidatePath("/wall/review");
}

export async function remove(form: FormData) {
  const pathname = form.get("pathname");
  if (!isAdmin(form.get("key")) || typeof pathname !== "string") return;
  if (!pathname.startsWith(PENDING) && !pathname.startsWith(APPROVED)) return;
  await del(pathname);
  revalidatePath("/wall");
  revalidatePath("/wall/review");
}

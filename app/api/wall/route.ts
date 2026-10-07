import { put } from "@vercel/blob";
import { PENDING } from "@/lib/wall";

/* A PNG from the Paint window, sent as the raw request body. */
const MAX_BYTES = 2 * 1024 * 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/* A few pins per visitor per hour. Kept in memory, so it's per instance and
   best effort: enough to stop someone hammering the button. */
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) return Response.json({ error: "Too many drawings, try again later." }, { status: 429 });

  if (request.headers.get("content-type") !== "image/png") {
    return Response.json({ error: "Expected a PNG." }, { status: 415 });
  }
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.length > MAX_BYTES) return Response.json({ error: "That drawing is too big." }, { status: 413 });
  if (!PNG_SIGNATURE.every((b, i) => body[i] === b)) {
    return Response.json({ error: "Expected a PNG." }, { status: 415 });
  }

  try {
    await put(`${PENDING}drawing.png`, Buffer.from(body), {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: true,
    });
  } catch {
    return Response.json({ error: "Couldn't save it right now." }, { status: 503 });
  }
  return Response.json({ ok: true }, { status: 201 });
}

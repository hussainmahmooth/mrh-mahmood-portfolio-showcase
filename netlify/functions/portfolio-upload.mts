import { randomUUID } from "node:crypto";
import type { Config } from "@netlify/functions";
import { authenticated, fileStore, json, sameOrigin } from "../lib/auth.mts";

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(req) || !(await authenticated(req))) return json({ error: "Please sign in to upload files." }, 401);
  try {
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (!bytes.length || bytes.length > 4 * 1024 * 1024) return json({ error: "Choose a file smaller than 4 MB." }, 413);
    const hex = Buffer.from(bytes.slice(0, 12)).toString("hex");
    const start = new TextDecoder().decode(bytes.slice(0, 12));
    let type = "", ext = "";
    if (start.startsWith("%PDF-")) { type = "application/pdf"; ext = "pdf"; }
    else if (hex.startsWith("89504e470d0a1a0a")) { type = "image/png"; ext = "png"; }
    else if (hex.startsWith("ffd8ff")) { type = "image/jpeg"; ext = "jpg"; }
    else if (start.startsWith("RIFF") && start.slice(8, 12) === "WEBP") { type = "image/webp"; ext = "webp"; }
    if (!type || req.headers.get("content-type") !== type) return json({ error: "Only genuine PDF, JPG, PNG, and WebP files are supported." }, 400);
    const key = `${randomUUID()}.${ext}`;
    await fileStore().set(key, bytes.buffer, { metadata: { type } });
    return json({ url: `/api/files/${key}` }, 201);
  } catch (error) {
    console.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Upload failed. Please try again." }, 503);
  }
};
export const config: Config = { path: "/api/owner/upload", rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 30 } };

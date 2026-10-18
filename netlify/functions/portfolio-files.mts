import type { Config, Context } from "@netlify/functions";
import { fileStore, json } from "../lib/auth.mts";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET" && req.method !== "HEAD") return json({ error: "Method not allowed." }, 405);
  const key = context.params.key;
  if (!/^[a-f0-9-]{36}\.(pdf|png|jpg|webp)$/.test(key ?? "")) return json({ error: "File not found." }, 404);
  try {
    const entry = await fileStore().getWithMetadata(key, { type: "arrayBuffer" });
    if (!entry) return json({ error: "File not found." }, 404);
    return new Response(req.method === "HEAD" ? null : entry.data, { headers: {
      "Content-Type": String(entry.metadata.type), "Content-Disposition": `inline; filename="${key}"`,
      "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'", ...(entry.etag ? { "ETag": entry.etag } : {}),
    } });
  } catch { return json({ error: "File storage is temporarily unavailable." }, 503); }
};
export const config: Config = { path: "/api/files/:key" };

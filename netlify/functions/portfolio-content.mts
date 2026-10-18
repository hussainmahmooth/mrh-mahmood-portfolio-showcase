import type { Config } from "@netlify/functions";
import { portfolioSchema } from "../../src/lib/portfolio-schema.ts";
import { authenticated, contentStore, json, sameOrigin } from "../lib/auth.mts";

export default async (req: Request) => {
  try {
    if (req.method === "GET") return json({ content: await contentStore().get("published", { type: "json" }) });
    if (req.method !== "PUT") return json({ error: "Method not allowed." }, 405);
    if (!sameOrigin(req) || !(await authenticated(req))) return json({ error: "Please sign in to publish changes." }, 401);
    const text = await req.text();
    if (Buffer.byteLength(text) > 1000000) return json({ error: "Portfolio content is too large." }, 413);
    const result = portfolioSchema.safeParse(JSON.parse(text));
    if (!result.success) return json({ error: result.error.issues.map(x => `${x.path.join(".")}: ${x.message}`).join("\n") }, 400);
    await contentStore().setJSON("published", result.data);
    return json({ ok: true, publishedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Portfolio storage failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Could not access portfolio storage. Your changes have not been published." }, 503);
  }
};
export const config: Config = { path: "/api/portfolio" };

import type { Config } from "@netlify/functions";
import { authenticated, checkPassword, cookie, credentials, env, equal, getOwner, json, ownerStore, sameOrigin, sessionToken } from "../lib/auth.mts";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      const owner = await authenticated(req);
      return json({ authenticated: !!owner, username: owner?.username, setupRequired: !(await getOwner()), configured: !!env("OWNER_SETUP_TOKEN") && (env("OWNER_SESSION_SECRET")?.length ?? 0) >= 32 });
    }
    if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!sameOrigin(req)) return json({ error: "Request origin rejected." }, 403);
    if (Number(req.headers.get("content-length")) > 8192) return json({ error: "Request too large." }, 413);
    const body = await req.text();
    if (body.length > 8192) return json({ error: "Request too large." }, 413);
    const input = JSON.parse(body);
    if (input.action === "logout") return json({ ok: true }, 200, { "Set-Cookie": cookie(req, "", true) });
    const username = typeof input.username === "string" ? input.username.trim() : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (password.length > 256 || username.length > 100) return json({ error: "Invalid credentials." }, 400);
    const owner = await getOwner();
    if (input.action === "login") {
      if (!owner || !checkPassword(owner, password) || !equal(owner.username, username)) return json({ error: "Incorrect username or password." }, 401);
      return json({ ok: true }, 200, { "Set-Cookie": cookie(req, sessionToken(owner)) });
    }
    if (input.action === "setup" || input.action === "password") {
      if (!/^[a-zA-Z0-9@._+-]{3,100}$/.test(username) || password.length < 12) return json({ error: "Use a username of at least 3 characters and a password of at least 12 characters." }, 400);
      if (input.action === "setup") {
        const token = env("OWNER_SETUP_TOKEN");
        if (!token || typeof input.token !== "string" || !equal(token, input.token)) return json({ error: "Invalid owner setup key." }, 403);
        if (owner) return json({ error: "An owner already exists. Please sign in." }, 409);
        // Check session configuration before creating the one-time account.
        const next = credentials(username, password); const session = sessionToken(next);
        const result = await ownerStore().setJSON("credentials", next, { onlyIfNew: true });
        if (!result.modified) return json({ error: "An owner already exists. Please sign in." }, 409);
        return json({ ok: true }, 201, { "Set-Cookie": cookie(req, session) });
      }
      const current = await authenticated(req);
      if (!current || typeof input.currentPassword !== "string" || input.currentPassword.length > 256 || !checkPassword(current, input.currentPassword)) return json({ error: "Your current password is incorrect or your session expired." }, 401);
      const next = credentials(username, password); const session = sessionToken(next);
      await ownerStore().setJSON("credentials", next);
      return json({ ok: true }, 200, { "Set-Cookie": cookie(req, session) });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Invalid request." }, 400);
    console.error("Owner authentication failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Authentication is unavailable. Check the Netlify owner configuration." }, 503);
  }
};
export const config: Config = { path: "/api/owner/auth", rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 } };

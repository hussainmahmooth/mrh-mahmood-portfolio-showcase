import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getContext } from "@netlify/functions";

export interface Owner { username: string; salt: string; hash: string; version: string }
export function env(key: string) { return globalThis.Netlify?.env.get(key) ?? process.env[key]; }
export function storeName(kind: string) {
  let scope = env("CONTEXT");
  // Runtime deploy context is authoritative; build-only variables may be absent.
  try { scope = getContext().deploy.context || scope; } catch { /* Direct local handler tests use CONTEXT. */ }
  return `portfolio-${kind}-${scope === "production" ? "production" : scope === "dev" || !scope ? "local" : "preview"}`;
}
export const ownerStore = () => getStore({ name: storeName("owner"), consistency: "strong" });
export const contentStore = () => getStore({ name: storeName("content"), consistency: "strong" });
export const fileStore = () => getStore({ name: storeName("files"), consistency: "strong" });
export const getOwner = () => ownerStore().get("credentials", { type: "json" }) as Promise<Owner | null>;
export function equal(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function credentials(username: string, password: string): Owner {
  const salt = randomBytes(32).toString("hex");
  return { username, salt, hash: scryptSync(password, salt, 64).toString("hex"), version: randomBytes(24).toString("hex") };
}
export function checkPassword(owner: Owner, password: string) { return equal(owner.hash, scryptSync(password, owner.salt, 64).toString("hex")); }
function secret() { const value = env("OWNER_SESSION_SECRET"); if (!value || value.length < 32) throw new Error("Owner authentication needs configuration."); return value; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
export function sessionToken(owner: Owner) {
  const value = Buffer.from(JSON.stringify({ version: owner.version, exp: Date.now() + 8 * 3600000 })).toString("base64url");
  return `${value}.${sign(value)}`;
}
export async function authenticated(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith("portfolio_owner="))?.slice(16);
    if (!token) return null;
    const [value, signature, extra] = token.split(".");
    if (extra || !signature || !equal(sign(value), signature)) return null;
    const payload = JSON.parse(Buffer.from(value, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
    const owner = await getOwner();
    return owner && equal(owner.version, payload.version ?? "") ? owner : null;
  } catch { return null; }
}
export function cookie(req: Request, token: string, clear = false) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return `portfolio_owner=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : 28800}${secure}`;
}
export function sameOrigin(req: Request) { return req.headers.get("origin") === new URL(req.url).origin; }
export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}

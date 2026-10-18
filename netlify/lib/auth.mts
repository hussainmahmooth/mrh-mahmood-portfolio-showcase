import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getContext } from "@netlify/functions";
import { initialSetupKeyHash } from "./setup-key.mts";

export interface Owner { username: string; salt: string; hash: string; version: string; sessionSecret: string }
export function env(key: string) { return globalThis.Netlify?.env.get(key) ?? process.env[key]; }
export function deployScope() {
  let scope = env("CONTEXT");
  // Runtime deploy context is authoritative; build-only variables may be absent.
  try { scope = getContext().deploy.context || scope; } catch { /* Direct local handler tests use CONTEXT. */ }
  return scope;
}
export function storeName(kind: string) {
  const scope = deployScope();
  return `portfolio-${kind}-${scope === "production" ? "production" : scope === "dev" || !scope ? "local" : "preview"}`;
}
export function setupConfigured() { return !!env("OWNER_SETUP_TOKEN") || (deployScope() === "production" && !!initialSetupKeyHash); }
export function validSetupKey(key: unknown) {
  if (typeof key !== "string" || key.length > 256) return false;
  const override = env("OWNER_SETUP_TOKEN");
  if (override) return equal(override, key);
  return deployScope() === "production" && equal(initialSetupKeyHash, createHash("sha256").update(key).digest("hex"));
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
  return { username, salt, hash: scryptSync(password, salt, 64).toString("hex"), version: randomBytes(24).toString("hex"), sessionSecret: randomBytes(48).toString("hex") };
}
export function checkPassword(owner: Owner, password: string) { return equal(owner.hash, scryptSync(password, owner.salt, 64).toString("hex")); }
function sign(value: string, owner: Owner) {
  if (!owner.sessionSecret || owner.sessionSecret.length < 32) throw new Error("Invalid owner session configuration.");
  return createHmac("sha256", owner.sessionSecret).update(value).digest("base64url");
}
export function sessionToken(owner: Owner) {
  const value = Buffer.from(JSON.stringify({ version: owner.version, exp: Date.now() + 8 * 3600000 })).toString("base64url");
  return `${value}.${sign(value, owner)}`;
}
export async function authenticated(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith("portfolio_owner="))?.slice(16);
    if (!token) return null;
    const owner = await getOwner();
    if (!owner) return null;
    const [value, signature, extra] = token.split(".");
    if (extra || !signature || !equal(sign(value, owner), signature)) return null;
    const payload = JSON.parse(Buffer.from(value, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
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

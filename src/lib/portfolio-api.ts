import defaults from "@/data/portfolio.json";
import { portfolioSchema, type Portfolio } from "./portfolio-schema";
export const defaultPortfolio: Portfolio = portfolioSchema.parse(defaults);
export async function api<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { ...(typeof options.body === "string" ? { "Content-Type": "application/json" } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({ error: "The server is unavailable. Run with Netlify Dev or deploy to Netlify." }));
  if (!response.ok || data.error) throw new Error(data.error || `Request failed (${response.status}).`);
  return data as T;
}
export async function fetchPortfolio() {
  const result = await api<{ content: Portfolio | null }>("/api/portfolio", { cache: "no-store" });
  return result.content ? portfolioSchema.parse(result.content) : structuredClone(defaultPortfolio);
}
export async function uploadFile(file: File, kind: "image" | "pdf") {
  const valid = kind === "pdf" ? ["application/pdf"] : ["image/jpeg", "image/png", "image/webp"];
  if (!valid.includes(file.type)) throw new Error(kind === "pdf" ? "Choose a PDF document." : "Choose a JPG, PNG, or WebP image.");
  if (file.size > 4 * 1024 * 1024) throw new Error("Choose a file smaller than 4 MB.");
  return api<{ url: string }>("/api/owner/upload", { method: "POST", headers: { "Content-Type": file.type }, body: file });
}

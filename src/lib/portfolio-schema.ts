import { z } from "zod";

const text = z.string().max(20000);
export const safeUrl = z.string().max(2048).refine(value => !value || /^https?:\/\/[^\s]+$/i.test(value) || /^\/(?!\/)[a-zA-Z0-9_./?=&%-]*$/.test(value), "Use an https:// URL or a local file path.");
export const entrySchema = z.object({
  id: z.string().min(1).max(100), title: text, subtitle: text, date: text,
  description: text, detail: text, tags: z.array(z.string().max(200)).max(50),
  url: safeUrl, github: safeUrl, pdf: safeUrl, image: safeUrl,
  category: text, level: z.number().min(0).max(100),
});
export const groupIds = ["interests", "stats", "education", "skills", "qualifications", "certifications", "experience", "projects", "thoughts", "achievements", "goals", "aspirations", "social"] as const;
export type GroupId = typeof groupIds[number];
const sectionSchema = z.object({ title: text, description: text, visible: z.boolean(), items: z.array(entrySchema).max(100) });
export const portfolioSchema = z.object({
  profile: z.object({ name: text, title: text, summary: text, photo: safeUrl, aboutTitle: text, about: text, traits: text, email: z.string().email().or(z.literal("")), phone: z.string().max(60).regex(/^[+\d\s().-]*$/, "Use a valid phone number."), location: text, availability: text, resume: safeUrl, resumeLabel: text }),
  settings: z.object({ siteTitle: text, description: text, accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), footer: text, contactTitle: text, contactDescription: text, showContact: z.boolean() }),
  sections: z.object(Object.fromEntries(groupIds.map(id => [id, sectionSchema])) as Record<GroupId, typeof sectionSchema>),
});
export type Portfolio = z.infer<typeof portfolioSchema>;
export type Entry = z.infer<typeof entrySchema>;
export const emptyEntry = (): Entry => ({ id: crypto.randomUUID(), title: "", subtitle: "", date: "", description: "", detail: "", tags: [], url: "", github: "", pdf: "", image: "", category: "", level: 0 });

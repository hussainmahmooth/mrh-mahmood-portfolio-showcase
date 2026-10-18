import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Award, BriefcaseBusiness, Check, ChevronRight, Code2, Download, Eye, FileText, GraduationCap, Image, LayoutDashboard, Loader2, LockKeyhole, LogOut, Menu, MessageSquareText, Plus, Save, Settings2, ShieldCheck, Sparkles, Trash2, Upload, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api, defaultPortfolio, fetchPortfolio, uploadFile } from "@/lib/portfolio-api";
import { emptyEntry, groupIds, portfolioSchema, type Entry, type GroupId, type Portfolio } from "@/lib/portfolio-schema";
import "./owner.css";
import "./owner-night.css";

type Session = { authenticated: boolean; username?: string; setupRequired: boolean; configured: boolean };
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "profile", label: "Profile & about", icon: UserRound },
  { id: "resume", label: "Resume", icon: FileText }, { id: "projects", label: "Projects", icon: Code2 },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness }, { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award }, { id: "thoughts", label: "Thoughts & notes", icon: MessageSquareText },
  { id: "skills", label: "Skills", icon: Sparkles }, { id: "qualifications", label: "Qualifications", icon: Award },
  { id: "achievements", label: "Achievements", icon: Award }, { id: "goals", label: "Goals", icon: Sparkles },
  { id: "aspirations", label: "Aspirations", icon: Sparkles }, { id: "interests", label: "Interests", icon: Sparkles },
  { id: "stats", label: "Profile stats", icon: LayoutDashboard }, { id: "social", label: "Social links", icon: ArrowUpRight },
  { id: "settings", label: "Site settings", icon: Settings2 }, { id: "security", label: "Login & security", icon: ShieldCheck },
];
const isGroup = (id: string): id is GroupId => groupIds.includes(id as GroupId);
function Field({ label, value, onChange, multiline = false, type = "text", hint = "", required = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; hint?: string; required?: boolean }) {
  return <label className={`owner-field ${multiline ? "owner-wide" : ""}`}><span>{label}</span>{multiline ? <Textarea value={value} onChange={e => onChange(e.target.value)} rows={5} required={required} /> : <Input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} />}{hint && <small>{hint}</small>}</label>;
}
function UploadField({ label, value, onChange, kind, onBusy }: { label: string; value: string; onChange: (v: string) => void; kind: "image" | "pdf"; onBusy: (v: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); onBusy(true);
    try { const data = await uploadFile(file, kind); onChange(data.url); toast.success("File uploaded. Publish your changes to display it on your portfolio."); } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  return <div className="owner-wide owner-upload"><div className="owner-upload-icon">{kind === "image" ? <Image /> : <FileText />}</div><div className="flex-1 min-w-0"><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground mt-1">{kind === "pdf" ? "PDF document" : "JPG, PNG, or WebP"} · up to 4 MB</p>{value && <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex gap-1 items-center mt-2">View current file<ArrowUpRight size={14} /></a>}</div><div className="flex gap-2 flex-wrap"><label className={`owner-upload-button ${busy ? "opacity-50" : ""}`}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? "Uploading…" : value ? "Replace file" : "Upload file"}<input type="file" className="sr-only" disabled={busy} accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp"} onChange={e => { upload(e.target.files?.[0]); e.target.value = ""; }} /></label>{value && <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => onChange("")}>Remove</Button>}</div></div>;
}

export default function Owner() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    document.title = "Owner Studio · Portfolio";
    const meta = document.createElement("meta"); meta.name = "robots"; meta.content = "noindex,nofollow"; document.head.appendChild(meta);
    api<Session>("/api/owner/auth").then(setSession).catch(e => setError(e.message));
    return () => meta.remove();
  }, []);
  if (error) return <div className="owner-auth"><div className="owner-auth-card"><LockKeyhole /><h1>Owner login is unavailable</h1><p>{error}</p><Button onClick={() => location.reload()}>Try again</Button><Link to="/">Back to portfolio</Link></div></div>;
  if (!session) return <div className="owner-auth"><Loader2 className="animate-spin" aria-label="Checking owner session" /></div>;
  return session.authenticated ? <Dashboard session={session} onLogout={() => setSession({ ...session, authenticated: false })} /> : <Login session={session} onLogin={async () => setSession(await api<Session>("/api/owner/auth"))} />;
}

function Login({ session, onLogin }: { session: Session; onLogin: () => Promise<void> }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState(() => new URLSearchParams(location.hash.slice(1)).get("setup") || "");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (location.hash) history.replaceState(null, "", location.pathname); }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (session.setupRequired && password !== confirm) { setError("The passwords do not match."); return; }
    setBusy(true);
    try { await api("/api/owner/auth", { method: "POST", body: JSON.stringify({ action: session.setupRequired ? "setup" : "login", username, password, token }) }); setPassword(""); setConfirm(""); setToken(""); await onLogin(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="owner-auth"><div className="owner-auth-story"><Link to="/" className="inline-flex gap-2 items-center text-sm"><ArrowLeft size={16} />Back to portfolio</Link><div><span className="owner-eyebrow">YOUR WORK. YOUR STORY.</span><h1>A little space<br />to make it<br /><em>your own.</em></h1><p>Update your work, share what’s new, and keep your portfolio moving with you.</p></div><span className="text-sm opacity-60">PORTFOLIO / OWNER STUDIO</span></div><div className="owner-auth-panel"><div className="owner-auth-card"><div className="owner-brand-icon"><Sparkles /></div><span className="owner-eyebrow">OWNER STUDIO</span><h1>{session.setupRequired ? "Make yourself at home." : "Welcome back."}</h1><p>{session.setupRequired ? "Create your private owner login to start customizing your portfolio." : "Sign in to bring your portfolio up to date."}</p>
    {!session.configured && session.setupRequired && <div className="owner-notice">Owner setup is not configured in this deployment. Use your private production setup link. For local development, see OWNER_GUIDE.md.</div>}
    <form onSubmit={submit} className="space-y-5">
      {session.setupRequired && <Field label="Private setup key" type="password" value={token} onChange={setToken} required hint="Use the private key provided during setup." />}
      <label className="owner-field"><span>Username</span><Input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required minLength={session.setupRequired ? 3 : 1} /></label>
      <label className="owner-field"><span>Password</span><Input type="password" autoComplete={session.setupRequired ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={session.setupRequired ? 12 : 1} maxLength={256} />{session.setupRequired && <small>Choose at least 12 characters.</small>}</label>
      {session.setupRequired && <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />}
      {error && <p role="alert" className="owner-error">{error}</p>}
      <Button type="submit" className="w-full owner-primary" size="lg" disabled={busy || (session.setupRequired && !session.configured)}>{busy ? <Loader2 size={17} className="animate-spin mr-2" /> : <LockKeyhole size={17} className="mr-2" />}{session.setupRequired ? "Create owner login" : "Sign in to your dashboard"}</Button>
    </form><p className="owner-security-note"><ShieldCheck size={15} />Private access, just for you.</p></div></div></div>;
}

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [tab, setTab] = useState("overview"); const [mobile, setMobile] = useState(false);
  const [content, setContent] = useState<Portfolio>(structuredClone(defaultPortfolio));
  const [published, setPublished] = useState(""); const [loaded, setLoaded] = useState(false); const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false); const [uploads, setUploads] = useState(0); const [lastPublished, setLastPublished] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const contentRef = useRef(content); contentRef.current = content;
  const draftKey = `portfolio-draft:${location.host}`;
  const dirty = loaded && JSON.stringify(content) !== published;
  const uploadBusy = (v: boolean) => setUploads(n => Math.max(0, n + (v ? 1 : -1)));
  async function load() {
    setLoadError("");
    try { const next = await fetchPortfolio(); setContent(next); setPublished(JSON.stringify(next)); setLoaded(true); setHasDraft(!!localStorage.getItem(draftKey)); } catch (e) { setLoadError((e as Error).message); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!loaded || !dirty) return;
    const timer = setTimeout(() => { try { localStorage.setItem(draftKey, JSON.stringify(content)); } catch { toast.error("Browser draft storage is full. Export a backup to keep your changes."); } }, 500);
    return () => clearTimeout(timer);
  }, [content, dirty, loaded, draftKey]);
  useEffect(() => { const listener = (e: BeforeUnloadEvent) => { if (dirty || uploads) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", listener); return () => window.removeEventListener("beforeunload", listener); }, [dirty, uploads]);
  function editProfile(key: keyof Portfolio["profile"], value: string) { setContent(c => ({ ...c, profile: { ...c.profile, [key]: value } })); }
  function editSettings(key: keyof Portfolio["settings"], value: string | boolean) { setContent(c => ({ ...c, settings: { ...c.settings, [key]: value } })); }
  function editSection(id: GroupId, patch: Partial<Portfolio["sections"][GroupId]>) { setContent(c => ({ ...c, sections: { ...c.sections, [id]: { ...c.sections[id], ...patch } } })); }
  async function publish() {
    const result = portfolioSchema.safeParse(content);
    if (!result.success) { toast.error(result.error.issues.map(x => `${x.path.join(".")}: ${x.message}`).join("\n"), { duration: 9000 }); return; }
    setSaving(true); const snapshot = JSON.stringify(result.data);
    try { const data = await api<{ publishedAt: string }>("/api/portfolio", { method: "PUT", body: snapshot }); setPublished(snapshot); if (JSON.stringify(contentRef.current) === snapshot) localStorage.removeItem(draftKey); setLastPublished(data.publishedAt); setHasDraft(false); toast.success("Published! Your portfolio is up to date."); } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  function preview() { sessionStorage.setItem("portfolio-preview", JSON.stringify(content)); window.open("/?preview=1", "_blank"); }
  function exportBackup() { const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); }
  async function logout() { if (uploads) { toast.error("Wait for your upload to finish."); return; } if (dirty && !window.confirm("Your unpublished edits are saved as a browser draft. Sign out?")) return; try { if (dirty) localStorage.setItem(draftKey, JSON.stringify(content)); await api("/api/owner/auth", { method: "POST", body: JSON.stringify({ action: "logout" }) }); onLogout(); } catch (e) { toast.error((e as Error).message); } }
  const select = (id: string) => { setTab(id); setMobile(false); window.scrollTo(0, 0); };
  const title = navigation.find(x => x.id === tab)?.label || "Overview";
  return <div className="owner-shell">
    {mobile && <button className="owner-overlay" onClick={() => setMobile(false)} aria-label="Close navigation" />}
    <aside className={`owner-sidebar ${mobile ? "is-open" : ""}`}><div className="owner-logo"><div className="owner-brand-icon"><Sparkles size={20} /></div><div>Portfolio<span>OWNER STUDIO</span></div><Button className="lg:hidden ml-auto" size="icon" variant="ghost" onClick={() => setMobile(false)} aria-label="Close sidebar"><X size={18} /></Button></div><nav aria-label="Dashboard navigation">{navigation.map((item, i) => <div key={item.id}>{i === 1 && <p className="owner-nav-heading">YOUR CONTENT</p>}{i === 16 && <p className="owner-nav-heading">MANAGE</p>}<button className={`owner-nav-item ${tab === item.id ? "active" : ""}`} onClick={() => select(item.id)}><item.icon size={17} />{item.label}{isGroup(item.id) && <span>{content.sections[item.id].items.length}</span>}</button></div>)}</nav><div className="owner-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} />View portfolio</a><button onClick={logout}><LogOut size={16} />Sign out</button><div className="owner-account"><span>{session.username?.slice(0, 1).toUpperCase()}</span><div>{session.username}<small>Portfolio owner</small></div></div></div></aside>
    <div className="owner-workspace"><header className="owner-topbar"><div className="flex items-center gap-3"><Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobile(true)} aria-label="Open sidebar"><Menu size={20} /></Button><span className="text-muted-foreground hidden sm:inline">Owner studio</span><ChevronRight size={14} className="text-muted-foreground hidden sm:inline" /><span>{title}</span></div><div className="flex items-center gap-2 sm:gap-3"><span className={`owner-save-status ${dirty ? "is-dirty" : ""}`}><span />{dirty ? "Unpublished edits" : "Up to date"}</span><Button variant="outline" size="sm" onClick={preview} disabled={!loaded || !!uploads}><Eye size={16} className="sm:mr-2" /><span className="hidden sm:inline">Preview</span></Button><Button className="owner-primary" size="sm" disabled={!loaded || saving || !!uploads || !dirty} onClick={publish}>{saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}{saving ? "Publishing…" : "Publish"}</Button></div></header>
      <main className="owner-main"><div className="owner-page-heading"><div><span className="owner-eyebrow">YOUR PORTFOLIO, IN YOUR HANDS</span><h1>{tab === "overview" ? `Welcome back, ${content.profile.name.split(" ").pop()}.` : title}</h1><p>{tab === "overview" ? "A new project, a fresh perspective, your next chapter. Start here." : "Make your changes, preview your portfolio, then publish when you’re ready."}</p></div></div>
      {loadError && <div role="alert" className="owner-notice owner-error">{loadError}<Button variant="outline" className="ml-4" onClick={load}>Retry loading</Button></div>}
      {!loaded && !loadError && <div className="owner-panel"><Loader2 className="animate-spin" />Loading your portfolio…</div>}
      {hasDraft && loaded && <div className="owner-notice flex flex-wrap gap-3 items-center"><Save size={18} /><span className="flex-1">You have a saved browser draft.</span><Button variant="outline" size="sm" onClick={() => { try { setContent(portfolioSchema.parse(JSON.parse(localStorage.getItem(draftKey) || ""))); setHasDraft(false); toast.success("Draft restored."); } catch { toast.error("This draft could not be restored."); } }}>Restore draft</Button><Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem(draftKey); setHasDraft(false); }}>Dismiss</Button></div>}
      {loaded && <fieldset disabled={!!uploads} className="min-w-0">
      {tab === "overview" && <>
        <div className="owner-welcome"><div><span className="owner-eyebrow">KEEP YOUR STORY CURRENT</span><h2>Good work deserves<br />a place to <em>shine.</em></h2><p>Your portfolio grows with you. Add what you’ve been building, learning, and thinking about.</p><Button onClick={() => select("projects")} className="owner-primary">Add your latest project<Plus size={17} className="ml-3" /></Button></div><div className="owner-profile-preview">{content.profile.photo ? <img src={content.profile.photo} alt="Your profile" /> : <UserRound size={48} />}<span className="owner-mini-tag"><span />YOUR PERSONAL SPACE</span><h3>{content.profile.name}</h3><p>{content.profile.title}</p><a href="/" target="_blank" rel="noopener noreferrer">Visit portfolio<ArrowUpRight size={16} /></a></div></div>
        <div className="owner-stats">{[{ label: "Projects", group: "projects", icon: Code2 }, { label: "Experience", group: "experience", icon: BriefcaseBusiness }, { label: "Certifications", group: "certifications", icon: Award }, { label: "Thoughts", group: "thoughts", icon: MessageSquareText }].map(x => <button key={x.group} onClick={() => select(x.group)}><x.icon size={20} /><strong>{content.sections[x.group as GroupId].items.length.toString().padStart(2, "0")}</strong><span>{x.label}<ArrowUpRight size={15} /></span></button>)}</div>
        <div className="owner-section-heading"><div><h2>Make it yours</h2><p>Little updates make a lasting impression.</p></div></div><div className="owner-quick-grid">{[{ title: "Put a face to your work", text: "Update your photo, introduction, and contact details.", tab: "profile", icon: UserRound }, { title: "Your next opportunity starts here", text: "Upload your latest resume and keep it ready to share.", tab: "resume", icon: FileText }, { title: "Share what’s on your mind", text: "Add a thought, a lesson, or a note from your journey.", tab: "thoughts", icon: MessageSquareText }].map(x => <button key={x.tab} onClick={() => select(x.tab)}><div className="owner-quick-icon"><x.icon size={20} /></div><h3>{x.title}</h3><p>{x.text}</p><span>Get started<ArrowUpRight size={16} /></span></button>)}</div><div className="owner-bottom-note"><ShieldCheck size={17} /><p>Only you can edit this space. Visitors see your published portfolio.</p>{lastPublished && <small>Published {new Date(lastPublished).toLocaleTimeString()}</small>}</div>
      </>}
      {tab === "profile" && <div className="owner-panel"><h2>Your introduction</h2><p className="owner-panel-description">The first impression, in your own words.</p><div className="owner-form-grid">{content.profile.photo && <img className="owner-avatar" src={content.profile.photo} alt="Current profile" />}<UploadField label="Profile photo" kind="image" value={content.profile.photo} onChange={v => editProfile("photo", v)} onBusy={uploadBusy} />{([ ["name", "Full name"], ["title", "Professional title"], ["summary", "Hero introduction"], ["aboutTitle", "About heading"], ["about", "About me"], ["traits", "Personal traits (comma separated)"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"], ["availability", "Availability message"] ] as const).map(([key, label]) => <Field key={key} label={label} value={content.profile[key]} onChange={v => editProfile(key, v)} multiline={["summary", "about"].includes(key)} />)}</div></div>}
      {tab === "resume" && <div className="owner-panel"><div className="owner-section-heading"><div><h2>Your latest resume</h2><p>Replace it here whenever your story moves forward.</p></div><FileText size={28} className="text-primary" /></div><div className="owner-form-grid"><UploadField label="Resume PDF" value={content.profile.resume} onChange={v => editProfile("resume", v)} kind="pdf" onBusy={uploadBusy} /><Field label="Download button label" value={content.profile.resumeLabel} onChange={v => editProfile("resumeLabel", v)} /><Field label="Or use a resume URL" value={content.profile.resume} onChange={v => editProfile("resume", v)} hint="Upload above or paste a public HTTPS link." /></div><div className="owner-notice mt-6">The resume button appears on your portfolio once you publish a PDF or link. Uploaded documents are public when linked from your portfolio.</div></div>}
      {isGroup(tab) && <SectionEditor group={tab} section={content.sections[tab]} onChange={patch => editSection(tab, patch)} onBusy={uploadBusy} disabled={!!uploads} />}
      {tab === "settings" && <div className="owner-panel"><h2>The finishing touches</h2><div className="owner-form-grid mt-6">{([ ["siteTitle", "Browser title"], ["description", "Search description"], ["footer", "Footer message"], ["contactTitle", "Contact heading"], ["contactDescription", "Contact introduction"] ] as const).map(([key, label]) => <Field key={key} label={label} value={content.settings[key]} onChange={v => editSettings(key, v)} multiline={key === "contactDescription"} />)}<Field label="Accent color" value={content.settings.accent} type="color" onChange={v => editSettings("accent", v)} /><label className="owner-switch"><Switch checked={content.settings.showContact} onCheckedChange={v => editSettings("showContact", v)} />Show contact section</label></div><div className="owner-section-heading mt-10"><div><h2>Content backup</h2><p>Export a copy or restore a previous backup. Uploaded files stay on this Netlify site.</p></div></div><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={exportBackup}><Download size={16} className="mr-2" />Export JSON backup</Button><label className="owner-upload-button"><Upload size={16} />Import backup<input type="file" accept="application/json,.json" className="sr-only" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { if (file.size > 1000000) throw new Error("Backup is too large."); const next = portfolioSchema.parse(JSON.parse(await file.text())); if (window.confirm("Replace your current draft with this backup? Your public portfolio will change only after you publish.")) { setContent(next); toast.success("Backup imported as a draft."); } } catch { toast.error("This is not a valid portfolio backup."); } e.target.value = ""; }} /></label><Button variant="ghost" onClick={() => { if (window.confirm("Discard unpublished edits and return to your last published content?")) { setContent(JSON.parse(published)); localStorage.removeItem(draftKey); setHasDraft(false); } }}>Discard unpublished edits</Button></div></div>}
      {tab === "security" && <Security username={session.username || ""} />}
      </fieldset>}
      </main><footer className="owner-dashboard-footer"><span>OWNER STUDIO</span><p>A space for your next chapter.</p></footer>
    </div>
  </div>;
}

function SectionEditor({ group, section, onChange, onBusy, disabled }: { group: GroupId; section: Portfolio["sections"][GroupId]; onChange: (p: Partial<Portfolio["sections"][GroupId]>) => void; onBusy: (v: boolean) => void; disabled: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => setOpenId(null), [group]);
  function edit(id: string, patch: Partial<Entry>) { onChange({ items: section.items.map(x => x.id === id ? { ...x, ...patch } : x) }); }
  function move(index: number, delta: number) { const items = [...section.items]; [items[index], items[index + delta]] = [items[index + delta], items[index]]; onChange({ items }); }
  return <><div className="owner-panel"><div className="owner-section-heading"><div><h2>Section settings</h2><p>Set the heading and choose whether visitors can see this section.</p></div><label className="owner-switch"><Switch checked={section.visible} onCheckedChange={v => onChange({ visible: v })} />{section.visible ? "Visible" : "Hidden"}</label></div><div className="owner-form-grid"><Field label="Section heading" value={section.title} onChange={v => onChange({ title: v })} /><Field label="Section introduction" value={section.description} onChange={v => onChange({ description: v })} /></div></div>
    <div className="owner-section-heading mt-8"><div><h2>Your entries <span className="owner-count">{section.items.length}</span></h2><p>Add, edit, and arrange your content.</p></div><Button className="owner-primary" disabled={section.items.length >= 100 || disabled} onClick={() => { const item = emptyEntry(); onChange({ items: [...section.items, item] }); setOpenId(item.id); }}><Plus size={16} className="mr-2" />Add entry</Button></div>
    {!section.items.length && <div className="owner-empty"><Plus size={30} /><h3>A fresh page, ready for you.</h3><p>Add your first entry. It will appear on your portfolio when you publish.</p></div>}
    <div className="space-y-4">{section.items.map((item, index) => <div className="owner-panel owner-entry" key={`${group}-${item.id}`}><div className="owner-entry-header"><button className="owner-entry-title" onClick={() => setOpenId(openId === item.id ? null : item.id)}><span>{(index + 1).toString().padStart(2, "0")}</span><div><strong>{item.title || "Untitled entry"}</strong><small>{item.subtitle || item.date || "Click to edit"}</small></div><ChevronRight className={openId === item.id ? "rotate-90" : ""} size={18} /></button><div className="flex shrink-0"><Button variant="ghost" size="icon" aria-label={`Move ${item.title || "entry"} up`} disabled={!index || disabled} onClick={() => move(index, -1)}><ArrowUp size={16} /></Button><Button variant="ghost" size="icon" aria-label={`Move ${item.title || "entry"} down`} disabled={index === section.items.length - 1 || disabled} onClick={() => move(index, 1)}><ArrowDown size={16} /></Button><Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${item.title || "entry"}`} disabled={disabled} onClick={() => { if (window.confirm(`Delete “${item.title || "Untitled entry"}” from your draft?`)) onChange({ items: section.items.filter(x => x.id !== item.id) }); }}><Trash2 size={16} /></Button></div></div>
      {openId === item.id && <div className="owner-form-grid mt-6"><Field label={group === "stats" ? "Label" : "Title / name"} value={item.title} onChange={v => edit(item.id, { title: v })} /><Field label={group === "stats" ? "Value (e.g. 10+)" : ["experience", "education", "certifications", "qualifications"].includes(group) ? "Company / institution / issuer" : "Subtitle"} value={item.subtitle} onChange={v => edit(item.id, { subtitle: v })} />{group !== "stats" && <><Field label="Date / period" value={item.date} onChange={v => edit(item.id, { date: v })} /><Field label="Category / status" value={item.category} onChange={v => edit(item.id, { category: v })} /><Field label={group === "thoughts" ? "Your thought / article" : "Description"} value={item.description} onChange={v => edit(item.id, { description: v })} multiline /><Field label="Extra details / highlights" value={item.detail} onChange={v => edit(item.id, { detail: v })} multiline /><Field label="Tags / technologies (comma separated)" value={item.tags.join(", ")} onChange={v => edit(item.id, { tags: v.split(",").map(x => x.trim()) })} /><Field label="Website / credential / live project URL" value={item.url} onChange={v => edit(item.id, { url: v })} />{group === "projects" && <Field label="GitHub repository URL" value={item.github} onChange={v => edit(item.id, { github: v })} />}{group === "skills" && <label className="owner-field"><span>Proficiency (0–100; 0 hides the bar)</span><Input type="number" min={0} max={100} value={item.level} onChange={e => edit(item.id, { level: Number(e.target.value) })} /></label>}<UploadField label="Cover image" kind="image" value={item.image} onChange={v => edit(item.id, { image: v })} onBusy={onBusy} /><UploadField label="Supporting PDF / certificate" kind="pdf" value={item.pdf} onChange={v => edit(item.id, { pdf: v })} onBusy={onBusy} /><Field label="Or use a public image URL" value={item.image} onChange={v => edit(item.id, { image: v })} /><Field label="Or use a public PDF URL" value={item.pdf} onChange={v => edit(item.id, { pdf: v })} /></>}</div>}
    </div>)}</div>
  </>;
}

function Security({ username }: { username: string }) {
  const [name, setName] = useState(username); const [current, setCurrent] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); if (password.length < 12 || password !== confirm) { toast.error("Use at least 12 characters and make sure both new passwords match."); return; } setBusy(true); try { await api("/api/owner/auth", { method: "POST", body: JSON.stringify({ action: "password", username: name, password, currentPassword: current }) }); setCurrent(""); setPassword(""); setConfirm(""); toast.success("Login updated. Previous sessions have been signed out."); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } }
  return <form className="owner-panel max-w-2xl space-y-5" onSubmit={submit}><h2>Your private login</h2><p className="owner-panel-description">Update your username and password. Your current password is required.</p><Field label="Username" value={name} onChange={setName} required /><Field label="Current password" type="password" value={current} onChange={setCurrent} required /><Field label="New password" type="password" value={password} onChange={setPassword} required hint="At least 12 characters." /><Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} required /><Button type="submit" className="owner-primary" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin mr-2" /> : <LockKeyhole size={16} className="mr-2" />}Update login</Button></form>;
}

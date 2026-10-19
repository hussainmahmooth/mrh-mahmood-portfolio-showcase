import { useEffect, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Award, Braces, BriefcaseBusiness, Check, Code2, Download, FileText, Github, GraduationCap, Mail, MapPin, Menu, Network, Phone, Terminal, X } from "lucide-react";
import { defaultPortfolio, fetchPortfolio } from "@/lib/portfolio-api";
import { portfolioSchema, type Entry, type GroupId, type Portfolio } from "@/lib/portfolio-schema";
import "./portfolio.css";
import PortfolioAssistant from "@/components/PortfolioAssistant";

const collectionOrder: GroupId[] = ["projects", "skills", "experience", "education", "qualifications", "certifications", "thoughts", "achievements", "goals", "aspirations"];
const collectionIcons = { projects: Braces, skills: Code2, experience: BriefcaseBusiness, education: GraduationCap, qualifications: Award, certifications: Award, thoughts: FileText, achievements: Award, goals: ArrowUpRight, aspirations: ArrowUpRight };
const labels: Record<string, string> = { projects: "SELECTED WORK", skills: "TECHNICAL TOOLKIT", experience: "EXPERIENCE", education: "EDUCATION", qualifications: "QUALIFICATIONS", certifications: "CREDENTIALS", thoughts: "THOUGHTS & NOTES", achievements: "MILESTONES", goals: "WHAT’S NEXT", aspirations: "LOOKING AHEAD" };
const shortLabels: Record<string, string> = { projects: "Work", skills: "Skills", certifications: "Credentials" };

function ProjectRepositoryReference({ url, title }: { url: string; title: string }) {
  if (!url.trim()) return null;
  let repositoryName = url;
  try {
    const parsed = new URL(url);
    repositoryName = `${parsed.hostname === "github.com" ? "" : parsed.hostname + "/"}${parsed.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/, "")}`;
  } catch { /* Draft previews retain the entered label. Published URLs are validated. */ }
  return <a className="folio-repository-reference" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${title} — GitHub repository`}>
    <span className="folio-repository-icon"><Github size={19}/></span>
    <span className="folio-repository-copy"><span>GitHub reference</span><strong>{repositoryName}</strong></span>
    <ArrowUpRight size={16}/>
  </a>;
}

function ItemCard({ item, group, index }: { item: Entry; group: GroupId; index: number }) {
  const Icon = collectionIcons[group as keyof typeof collectionIcons] || Code2;
  const isProject = group === "projects";
  return <article className={`folio-card ${isProject ? "folio-project" : ""}`}>
    {item.image ? <div className="folio-cover"><img src={item.image} alt={item.title} loading="lazy" /></div> : isProject && <div className={`folio-project-art project-art-${index % 4}`} aria-hidden="true"><div className="project-art-grid" /><div className="project-art-window"><div className="project-art-bar"><i /><i /><i /><span>{item.category || "PROJECT"} / SYSTEM</span></div><div className="project-art-body"><div className="project-node"><Braces size={24} /><span>application</span></div><div className="project-connector" /><div className="project-node"><Network size={24} /><span>services</span></div><div className="project-connector" /><div className="project-node"><Terminal size={24} /><span>data</span></div></div><div className="project-art-status"><span /><span>{item.tags.slice(0, 3).join(" / ")}</span></div></div><span className="project-art-index">0{index + 1}</span></div>}
    <div className="folio-card-content">
      <div className="folio-card-top"><div className="folio-icon"><Icon size={18}/></div>{item.category && <span className="folio-tag">{item.category}</span>}{isProject && <span className="folio-index">0{index + 1}</span>}</div>
      <h3>{item.title}</h3>
      {(item.subtitle || item.date) && <p className="folio-meta">{[item.subtitle,item.date].filter(Boolean).join(" · ")}</p>}
      {item.description && <p className="folio-description">{item.description}</p>}
      {item.detail && <p className="folio-detail">{item.detail}</p>}
      {!!item.tags.length && <div className="folio-tags">{item.tags.filter(Boolean).map((tag,i)=><span key={i}>{tag}</span>)}</div>}
      {group === "skills" && item.level > 0 && <div className="folio-progress" aria-label={`${item.level}% proficiency`}><span style={{width:`${item.level}%`}}/></div>}
      {isProject && <ProjectRepositoryReference url={item.github} title={item.title}/>}
      {(item.url || (!isProject && item.github) || item.pdf) && <div className="folio-card-links">
        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{isProject ? "View project" : "View credential / link"}<ArrowUpRight size={15}/></a>}
        {!isProject && item.github && <a href={item.github} target="_blank" rel="noopener noreferrer"><Github size={15}/>Source code</a>}
        {item.pdf && <a href={item.pdf} target="_blank" rel="noopener noreferrer"><FileText size={15}/>View PDF</a>}
      </div>}
    </div>
  </article>;
}

export function PortfolioView({ content, preview = false }: { content: Portfolio; preview?: boolean }) {
  const [menu, setMenu] = useState(false);
  const { profile: p, settings: s, sections } = content;
  const visible = collectionOrder.filter(id => sections[id].visible && sections[id].items.length);
  const names = p.name.trim().split(" "); const lastName = names.pop(); const firstName = names.join(" ");
  const nav = [...(sections.interests.visible ? [{id:"about",label:"About"}] : []), ...["projects", "skills", "certifications"].filter(id => visible.includes(id as GroupId)).map(id => ({id,label:shortLabels[id]})), ...(s.showContact ? [{id:"connect",label:"Contact"}] : [])];
  useEffect(() => {
    document.title = s.siteTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content",s.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",s.siteTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",s.description);
  }, [s.siteTitle,s.description]);
  return <div className="portfolio-site" style={{"--folio-accent":s.accent} as CSSProperties}>
    {preview && <div className="folio-preview-note">DRAFT PREVIEW · Only published changes are visible to visitors.</div>}
    <header className="folio-header"><div className="folio-container folio-header-inner"><a className="folio-logo" href="#home" aria-label={`${p.name} home`}><span className="folio-logo-mark">m<span>.</span></span><span className="folio-logo-name">{p.name}<small>PERSONAL PORTFOLIO</small></span></a><nav className={menu ? "folio-nav is-open" : "folio-nav"} aria-label="Main navigation">{nav.map(x => <a key={x.id} href={`#${x.id}`} onClick={() => setMenu(false)}>{x.label}</a>)}</nav><div className="folio-header-actions">{p.email && <a className="folio-hello" href={`mailto:${p.email}`}>Let’s talk<ArrowUpRight size={15} /></a>}<button className="folio-mobile-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu ? <X size={21} /> : <Menu size={21} />}</button></div></div></header>
    <main>
      <section id="home" className="folio-hero"><div className="hero-grid" aria-hidden="true" /><div className="folio-container folio-hero-layout"><div className="folio-hero-copy"><div className="folio-eyebrow"><span className="folio-small-line" />IT PROFESSIONAL · CREATIVE PROBLEM SOLVER</div><h1>{firstName && <span>{firstName}</span>}<strong>{lastName}<span className="hero-period">.</span></strong></h1><p className="folio-role"><span>&lt;</span> {p.title} <span>/&gt;</span></p><p className="folio-hero-summary">{p.summary}</p><div className="folio-hero-buttons">{visible.includes("projects") && <a className="folio-button primary" href="#projects">Explore my work<ArrowDown size={16} /></a>}{p.resume && <a className="folio-button secondary" href={p.resume} target="_blank" rel="noopener noreferrer"><Download size={16} />{p.resumeLabel || "Download resume"}</a>}</div>{p.availability && <div className="folio-availability"><span />{p.availability}</div>}</div><div className="folio-hero-portrait"><div className="portrait-corner corner-tl" /><div className="portrait-corner corner-tr" /><div className="portrait-corner corner-bl" /><div className="portrait-corner corner-br" /><div className="portrait-frame"><div className="portrait-toolbar"><span className="terminal-dots"><i /><i /><i /></span><span>profile.tsx</span><Code2 size={14} /></div>{p.photo ? <img className="portrait-image" src={p.photo} alt={`${p.name} — professional portrait`} /> : <div className="portrait-placeholder"><Code2 size={70} /></div>}<div className="portrait-caption"><div><span className="folio-code-token">const</span> developer = <span className="folio-code-token">&#123;</span></div><p>name: <span>"{p.name}"</span>,</p><p>mindset: <span>"always learning"</span></p><div className="folio-code-token">&#125;;</div></div></div><div className="portrait-floating-tag"><span className="floating-icon"><Terminal size={18} /></span><div>Turning ideas into reality<small>ONE LINE OF CODE AT A TIME</small></div><span className="floating-status" /></div></div></div><div className="folio-container hero-bottom"><a href="#about" className="hero-scroll"><span />SCROLL TO EXPLORE<ArrowDown size={13} /></a><span>DESIGN. DEVELOP. KEEP LEARNING.</span><span className="hero-coordinate">PORTFOLIO / {new Date().getFullYear()}</span></div></section>
      <div className="folio-tech-strip"><div className="folio-container"><span>BUILT ON CURIOSITY</span><div>{Array.from(new Set(sections.skills.items.flatMap(x => x.tags))).slice(0, 7).map((tag,i) => <span key={tag}><i>0{i+1}</i>{tag}</span>)}</div></div></div>
      {sections.interests.visible && <section className="folio-section folio-about" id="about"><div className="folio-container"><div className="folio-section-heading"><div><span className="folio-eyebrow">01 / ABOUT ME</span><h2>{sections.interests.title}<span className="folio-heading-dot">/</span></h2></div><p>{sections.interests.description}</p></div><div className="folio-about-grid"><div className="folio-about-story"><span className="folio-tiny-label">THE PERSON BEHIND THE CODE</span><h3>{p.aboutTitle}</h3><p>{p.about}</p><div className="folio-tags about-traits">{p.traits.split(",").filter(x => x.trim()).map((x,i) => <span key={i}><Check size={12} />{x.trim()}</span>)}</div></div><div className="folio-about-aside">{sections.interests.items.map((x,i) => <div className="folio-about-interest" key={x.id}><span className="interest-number">0{i+1}</span><div><h3>{x.title}</h3><p>{x.description}</p>{x.url && <a href={x.url} target="_blank" rel="noopener noreferrer">Read more<ArrowUpRight size={14}/></a>}{x.pdf && <a href={x.pdf} target="_blank" rel="noopener noreferrer">View PDF<FileText size={14}/></a>}</div></div>)}<div className="folio-about-location"><MapPin size={17} /><span>{p.location || p.title}</span><span className="location-orbit" /></div></div></div></div></section>}
      {sections.stats.visible && !!sections.stats.items.length && <div className="folio-container folio-custom-stats">{sections.stats.items.map(x => <div key={x.id}><strong>{x.subtitle}</strong><span>{x.title}</span></div>)}</div>}
      {visible.map((id,index) => <section className={`folio-section folio-collection folio-${id}`} id={id} key={id}><div className="folio-container"><div className="folio-section-heading"><div><span className="folio-eyebrow">{(index+2).toString().padStart(2,"0")} / {labels[id]}</span><h2>{sections[id].title}<span className="folio-heading-dot">/</span></h2></div><p>{sections[id].description}</p></div><div className={`folio-collection-grid ${["projects","thoughts"].includes(id) ? "two-column" : ""} ${["education","experience"].includes(id) ? "folio-timeline" : ""}`}>{sections[id].items.map((x,i) => <ItemCard item={x} group={id} index={i} key={x.id} />)}</div></div></section>)}
      {s.showContact && <section id="connect" className="folio-section folio-contact"><div className="folio-container"><div className="folio-contact-card"><div className="contact-orbit orbit-one" aria-hidden="true"/><div className="contact-orbit orbit-two" aria-hidden="true"/><div className="folio-contact-content"><span className="folio-eyebrow">HAVE SOMETHING IN MIND?</span><h2>{s.contactTitle}</h2><p>{s.contactDescription}</p>{p.email && <a className="folio-button primary contact-email" href={`mailto:${p.email}`}><Mail size={17}/>{p.email}<ArrowUpRight size={17}/></a>}<div className="folio-contact-details">{p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g,"")}`}><Phone size={14}/>{p.phone}</a>}{p.location && <span><MapPin size={14}/>{p.location}</span>}</div></div><div className="folio-contact-code" aria-hidden="true"><span>&lt;</span><Braces size={95} strokeWidth={1}/><span>/&gt;</span></div></div></div></section>}
      {sections.social.visible && sections.social.items.some(x => x.url) && <section className="folio-social-section" aria-label="Social links"><div className="folio-container folio-social-row"><span>{sections.social.title || "Find me online"}</span><div>{sections.social.items.filter(x => x.url).map(x => <a key={x.id} href={x.url} target="_blank" rel="noopener noreferrer">{x.title || "Social profile"}<ArrowUpRight size={15}/></a>)}</div></div></section>}
    </main>
    <footer className="folio-footer"><div className="folio-container"><div><a className="folio-footer-brand" href="#home">{p.name}<span>.</span></a><p>{s.footer}</p><a className="folio-owner-link" href="/owner">Owner</a></div><div className="folio-footer-right"><span>© {new Date().getFullYear()} · All rights reserved.</span><div><a href="#home">Back to top<ArrowUpRight size={13}/></a></div></div></div></footer>
    <PortfolioAssistant content={content}/>
  </div>;
}

export default function PortfolioPage() {
  const preview = new URLSearchParams(location.search).get("preview") === "1";
  const [content,setContent] = useState<Portfolio>(defaultPortfolio);
  useEffect(() => {
    if (preview) { try { const draft=sessionStorage.getItem("portfolio-preview"); if(draft) setContent(portfolioSchema.parse(JSON.parse(draft))); } catch { /* Fall back to the original portfolio when the draft is invalid. */ } }
    else { let active=true; const refresh=()=>fetchPortfolio().then(data=>{if(active)setContent(data);}).catch(()=>{}); refresh(); window.addEventListener("focus",refresh); return()=>{active=false;window.removeEventListener("focus",refresh);}; }
  },[preview]);
  return <PortfolioView content={content} preview={preview}/>;
}

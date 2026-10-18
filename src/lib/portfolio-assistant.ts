import type { Entry, GroupId, Portfolio } from "./portfolio-schema";

export type AssistantLink = { label: string; href: string };
export type AssistantReply = { text: string; links: AssistantLink[] };

const stopWords = new Set("a an the my your his her this that what which who tell me about do does did has have is are was were can could would please show explain give and or of for in to on with how i you he she it much more some know any there use using".split(" "));
const words = (text: string) => text.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim().split(/\s+/).filter(x => x.length > 1 && !stopWords.has(x));
const shorten = (text: string, length = 380) => text.length > length ? text.slice(0, length).replace(/\s\S*$/, "") + "…" : text;
const reply = (text: string, links: AssistantLink[] = []): AssistantReply => ({ text, links });
const available = (p: Portfolio, id: GroupId) => p.sections[id].visible ? p.sections[id].items : [];

function entryReply(item: Entry, group: GroupId): AssistantReply {
  const details = [item.title, [item.subtitle, item.date].filter(Boolean).join(" · "), shorten(item.description), item.tags.filter(Boolean).length ? `Technologies / highlights: ${item.tags.filter(Boolean).join(", ")}.` : "", shorten(item.detail, 220)].filter(Boolean);
  const links: AssistantLink[] = [];
  if (item.url) links.push({label: group === "projects" ? "View project" : "View link", href: item.url});
  if (item.github) links.push({label:"GitHub repository",href:item.github});
  if (item.pdf) links.push({label:"View PDF",href:item.pdf});
  links.push({label:"See on portfolio",href:`#${group === "interests" ? "about" : group}`});
  return reply(details.join("\n\n"), links);
}

function collectionReply(p: Portfolio, id: GroupId, intro: string): AssistantReply {
  const items = available(p,id);
  if (!items.length) return reply(`There are no published ${id === "experience" ? "work experience entries" : id} to share yet. You can explore the projects or contact ${p.profile.name} for more information.`, [{label:"Explore projects",href:"#projects"}, ...(p.profile.email ? [{label:"Send an email",href:`mailto:${p.profile.email}`}] : [])]);
  const lines = items.slice(0,6).map(x => `• ${x.title}${x.subtitle ? ` — ${x.subtitle}` : ""}${x.category ? ` (${x.category})` : ""}${id === "skills" && x.tags.length ? `: ${x.tags.filter(Boolean).slice(0,6).join(", ")}` : ""}`);
  return reply(`${intro}\n\n${lines.join("\n")}${items.length > 6 ? `\n\nThere are ${items.length} entries in total.` : ""}\n\nAsk me about a specific entry to learn more.`, [{label:`Explore ${id}`,href:`#${id}`}]);
}

export function answerPortfolioQuestion(question: string, p: Portfolio): AssistantReply {
  const q = question.toLowerCase().trim().slice(0,500);
  const name = p.profile.name || "the portfolio owner";
  if (!q || /^(hi|hello|hey|good morning|good evening|good afternoon|thanks|thank you)[!.\s]*$/.test(q)) return reply(`Hello! I’m ${name}’s portfolio assistant. I can help you explore projects, technical skills, education, certifications, experience, the resume, and contact details. What would you like to know?`);
  if (/\b(resume|cv|curriculum|vitae)\b/.test(q)) return p.profile.resume ? reply(`You can open ${name}’s current published resume below.`,[{label:p.profile.resumeLabel || "Open resume",href:p.profile.resume}]) : reply("A resume has not been published yet. You can contact the owner to request one.",p.profile.email ? [{label:"Request resume by email",href:`mailto:${p.profile.email}`}]:[]);

  // Match names from visible published entries before broad intents such as “skills”.
  const queryWords=words(q);
  const groups: GroupId[]=["projects","skills","education","certifications","qualifications","experience","thoughts","achievements"];
  const matches=groups.flatMap(group=>available(p,group).map(item=>{
    const titleWords=words(item.title+" "+item.subtitle);
    const hits=queryWords.filter(word=>titleWords.includes(word));
    const fullTitle=item.title.length>2 && q.includes(item.title.toLowerCase());
    return {item,group,score:fullTitle ? 100 : hits.length>=2 || (hits.length===1 && titleWords.length<=2) ? hits.length*10 : 0};
  })).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(matches.length) return entryReply(matches[0].item,matches[0].group);

  if (/\b(contact|email|e-mail|mail|phone|whatsapp|linkedin|github|reach|hire|hiring|availability|available|collaborate|collaboration|connect)\b/.test(q)) {
    const lines=[`Here is how to get in touch with ${name}:`,p.profile.email?`Email: ${p.profile.email}`:"",p.settings.showContact && p.profile.phone?`Phone: ${p.profile.phone}`:"",p.settings.showContact && p.profile.location?`Location: ${p.profile.location}`:"",p.profile.availability].filter(Boolean);
    const links: AssistantLink[]=[...(p.profile.email?[{label:"Send an email",href:`mailto:${p.profile.email}`}]:[]),...(p.settings.showContact && p.sections.social.visible?available(p,"social").filter(x=>x.url).map(x=>({label:x.title,href:x.url})):[])];
    return reply(lines.length>1?lines.join("\n\n"):"Contact details have not been published yet.",links);
  }
  if (/\b(location|located|live|based|country|city|where)\b/.test(q) && !/\b(study|studying|education|school|college)\b/.test(q)) return p.settings.showContact && p.profile.location ? reply(`The location listed on the portfolio is: ${p.profile.location}.`) : reply("A location has not been published on this portfolio.");
  if (/\b(certificat\w*|credential\w*|qualified|qualification\w*)\b/.test(q)) return collectionReply(p,"certifications",`${name}’s published certifications include:`);
  if (/\b(education|study|studies|studied|studying|school|college|university|degree|campus)\b/.test(q)) return collectionReply(p,"education",`${name}’s educational journey includes:`);
  if (/\b(experience|employment|employer|career|job|jobs|internship)\b/.test(q)) return collectionReply(p,"experience",`${name}’s published work experience:`);
  if (/\b(skill\w*|technolog\w*|stack|tools?|languages?|programming|proficiency)\b/.test(q)) return collectionReply(p,"skills",`${name}’s technical toolkit includes:`);
  if (/\b(project\w*|built|build|building|work|develop\w*)\b/.test(q)) return collectionReply(p,"projects",`${name} has published these projects:`);
  if (/\b(thought\w*|notes?|articles?|blog|writing)\b/.test(q)) return collectionReply(p,"thoughts","The latest published thoughts and notes:");
  if (/\b(achieve\w*|awards?|milestones?|hackathon)\b/.test(q)) return collectionReply(p,"achievements","The published achievements include:");
  if (/\b(goals?|aspirations?|future|plans?)\b/.test(q)) return collectionReply(p,"goals","The current published goals:");
  if (/\b(about|who|yourself|background|introduce|introduction|name)\b/.test(q)) return reply([`${name} — ${p.profile.title}`,p.sections.interests.visible ? shorten(p.profile.about,700) : p.profile.summary].filter(Boolean).join("\n\n"),p.sections.interests.visible?[{label:"Read about me",href:"#about"}]:[]);
  return reply("I answer questions using the information published in this portfolio. Try asking about projects, skills, education, certifications, experience, the resume, or contact details. I don’t have information on that topic.",[{label:"Explore projects",href:"#projects"},...(p.profile.email?[{label:"Ask the owner by email",href:`mailto:${p.profile.email}`}]:[])]);
}

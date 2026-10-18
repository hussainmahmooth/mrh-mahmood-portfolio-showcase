import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowUpRight, Check, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import type { Portfolio } from "@/lib/portfolio-schema";
import { answerPortfolioQuestion, type AssistantReply } from "@/lib/portfolio-assistant";
import "./portfolio-assistant.css";

type Message = {id:number;role:"assistant"|"visitor";reply:AssistantReply};
const welcome: Message={id:0,role:"assistant",reply:{text:"Hello! I can help you explore this portfolio. Ask me about projects, skills, education, certifications, the resume, or how to get in touch.",links:[]}};
const suggestions=["Show me the projects","What are your skills?","Download resume","How can I contact you?"];

export default function PortfolioAssistant({content}:{content:Portfolio}) {
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState("");
  const [messages,setMessages]=useState<Message[]>([welcome]);
  const counter=useRef(1);
  const history=useRef<HTMLDivElement>(null);
  const textbox=useRef<HTMLInputElement>(null);
  const launcher=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(open){history.current?.scrollTo({top:history.current.scrollHeight});}},[messages,open]);
  useEffect(()=>{if(open)textbox.current?.focus();},[open]);
  function close(){setOpen(false);launcher.current?.focus();}
  function ask(question:string){
    const text=question.trim().slice(0,500);if(!text)return;
    const visitor:Message={id:counter.current++,role:"visitor",reply:{text,links:[]}};
    const assistant:Message={id:counter.current++,role:"assistant",reply:answerPortfolioQuestion(text,content)};
    setMessages(current=>[...current.slice(-77),visitor,assistant]);setInput("");textbox.current?.focus();
  }
  function submit(e:FormEvent){e.preventDefault();ask(input);}
  return <div className="portfolio-assistant" style={{"--assistant-accent":content.settings.accent} as CSSProperties}>
    {open && <section id="portfolio-assistant-panel" className="assistant-panel" aria-label="Portfolio assistant" onKeyDown={e=>{if(e.key==="Escape")close();}}>
      <header className="assistant-header"><div className="assistant-avatar"><MessageCircle size={21}/></div><div className="assistant-heading"><h2>Portfolio assistant</h2><p><span/>Answers from this portfolio</p></div><button type="button" className="assistant-icon-button" title="Start a new conversation" aria-label="Start a new conversation" onClick={()=>{setMessages([welcome]);setInput("");textbox.current?.focus();}}><RotateCcw size={15}/></button><button type="button" className="assistant-icon-button" aria-label="Close portfolio assistant" onClick={close}><X size={19}/></button></header>
      <div className="assistant-history" ref={history} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0}>
        <div className="assistant-conversation-label">YOUR GUIDE TO {content.profile.name.toUpperCase() || "THIS PORTFOLIO"}</div>
        {messages.map(message=><div key={message.id} className={`assistant-message ${message.role}`}><span className="assistant-message-author">{message.role==="visitor"?"You":"Portfolio assistant"}</span><div className="assistant-message-body">{message.reply.text}</div>{message.reply.links.length>0 && <div className="assistant-message-links">{message.reply.links.map((link,i)=><a key={i} href={link.href} target={/^https?:|^\/api\/files|\.pdf(?:$|\?)/i.test(link.href)?"_blank":undefined} rel="noopener noreferrer" onClick={()=>{if(link.href.startsWith("#"))close();}}>{link.label}<ArrowUpRight size={13}/></a>)}</div>}</div>)}
      </div>
      <div className="assistant-suggestions" aria-label="Suggested questions">{suggestions.map(question=><button type="button" key={question} onClick={()=>ask(question)}>{question}</button>)}</div>
      <form className="assistant-form" onSubmit={submit}><label htmlFor="portfolio-assistant-question" className="sr-only">Ask a portfolio question</label><input ref={textbox} id="portfolio-assistant-question" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about my work…" maxLength={500} autoComplete="off"/><button type="submit" aria-label="Send question" disabled={!input.trim()}><Send size={17}/></button></form>
      <div className="assistant-footer"><Check size={11}/>Portfolio information only · No live agent</div>
    </section>}
    <button ref={launcher} type="button" className={`assistant-launcher ${open?"is-open":""}`} aria-label={open?"Close portfolio assistant":"Open portfolio assistant"} aria-expanded={open} aria-controls="portfolio-assistant-panel" onClick={()=>open?close():setOpen(true)}>{open?<X size={24}/>:<MessageCircle size={26}/>}</button>
  </div>;
}

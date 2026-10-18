import fs from 'node:fs';
function read(file, name) {
  const source = fs.readFileSync(`src/components/portfolio/${file}.tsx`, 'utf8');
  const match = source.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n  \\]);`));
  if (!match) throw new Error(`Missing ${name}`);
  return Function(`return (${match[1].replace(/icon: \w+/g, 'icon: "icon"')})`)();
}
const entry = (data, i) => ({id:`original-${i}`, title:'',subtitle:'',date:'',description:'',detail:'',tags:[],url:'',github:'',pdf:'',image:'',category:'',level:0,...data});
const section = (title, description, items = []) => ({title,description,visible:true,items:items.map(entry)});
const data = {
 profile: {name:'M.R.H. Mahmood',title:'IT Professional & Aspiring IT Undergraduate',summary:'Currently studying at ICST. Exploring the possibilities of web development, data science, cloud technologies, and artificial intelligence.',photo:'/profile.jpg',aboutTitle:'Curiosity, turned into capability.',about:"Passionate IT professional with a strong educational foundation and continuous learning mindset. Currently pursuing a Bachelor's degree in IT at ICST while building practical experience through hands-on projects.\n\nI am interested in full-stack development, data analytics, artificial intelligence, and cloud computing — and in using technology to solve real-world problems.\n\nMy goal is to bridge technical innovation and business needs, contributing to projects that make a difference.",traits:'Web Development, Data Science, Cloud Computing, Artificial Intelligence',email:'mahmoothhussain550@gmail.com',phone:'0758325511',location:'Remote location',availability:'Open to opportunities & collaborations',resume:'/my_CV.pdf',resumeLabel:'Download resume'},
 settings:{siteTitle:'M.R.H. Mahmood | IT Professional & Developer',description:'IT professional and aspiring IT undergraduate at ICST. Explore my projects in web development, data science, cloud technologies, and AI.',accent:'#60a5fa',footer:'Built with curiosity. Crafted with code.',contactTitle:'Let’s build something meaningful.',contactDescription:'Have an idea, an opportunity, or an interesting technical challenge? I would love to hear about it.',showContact:true},
 sections:{
 interests:section('A little about me','The person behind the projects.',[{title:'Current focus',description:"Pursuing a Bachelor's degree in IT at ICST while developing practical skills through projects in web development, data science, and cloud technologies."},{title:'Professional interests',description:'Full-stack development, data analytics, artificial intelligence, and cloud computing solutions.'}]),
 stats:section('At a glance','',[]),
 education:section('Learning, one chapter at a time.','My educational journey.',read('About','educationSteps').map(x=>({title:x.title,subtitle:x.institution,category:x.current?'Current':'',description:x.description}))),
 skills:section('The tools behind the work.','A growing toolkit for turning ideas into working solutions.',read('Skills','skills').map(x=>({title:x.title,description:x.description,category:x.level,tags:x.technologies}))),
 qualifications:section('Qualifications','Formal education and professional development',[]),
 certifications:section('Always learning. Always building.','Professional certifications across technology and business.',read('Qualifications','certificates').map(x=>({title:x.title,description:x.description,category:x.category,tags:[x.level]}))),
 experience:section('Experience & impact.','Where I have worked and what I have learned.'),
 projects:section('Ideas, brought to life.','A selection of projects across healthcare, education, and management.',read('Projects','projects').map(x=>({title:x.title,description:x.description,category:x.category,tags:x.technologies}))),
 thoughts:section('Notes from the journey.','Ideas, learning, and things on my mind.'),
 achievements:section('Milestones that matter.','A few moments from the journey.',read('Projects','achievements').map(x=>({title:x.title,description:x.description,category:x.highlight}))),
 goals:section('What comes next.','What I am working towards.',[]),
 aspirations:section('Looking ahead.','The direction I am growing in.',[]),
 social:section('Elsewhere on the internet','',read('Contact','socialLinks').map(x=>({title:x.label,url:x.label==='GitHub'?'https://github.com/hussainmahmooth':x.href}))),
 }
};
fs.mkdirSync('src/data',{recursive:true});
fs.writeFileSync('src/data/portfolio.json', JSON.stringify(data,null,2)+'\n');

const fs=require('fs'),path=require('path'),matter=require('gray-matter'),{marked}=require('marked');
const ROOT=__dirname,OUT=path.join(ROOT,'dist'),SITE=(process.env.URL||'').replace(/\/$/,''),NAME='The Daily Notebook';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cp=(a,b)=>fs.existsSync(a)&&fs.cpSync(a,b,{recursive:true});
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
cp(path.join(ROOT,'static'),OUT);cp(path.join(ROOT,'admin'),path.join(OUT,'admin'));
const G=['linear-gradient(135deg,#ffd6a5,#ffadad)','linear-gradient(135deg,#caffbf,#9bf6ff)','linear-gradient(135deg,#fdffb6,#ffc6ff)','linear-gradient(135deg,#a0c4ff,#bdb2ff)','linear-gradient(135deg,#bde0fe,#ffafcc)','linear-gradient(135deg,#ffe5d9,#d8e2dc)'];
const dir=path.join(ROOT,'content/posts');
const posts=fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>{
  const {data,content}=matter(fs.readFileSync(path.join(dir,f),'utf8'));
  return {slug:f.replace(/\.md$/,''),title:String(data.title||f),date:new Date(data.date||Date.now()),category:String(data.category||'General'),emoji:data.emoji||'📝',summary:String(data.summary||''),image:data.image||'',html:marked.parse(content),mins:Math.max(1,Math.round(content.split(/\s+/).length/200))};
}).sort((a,b)=>b.date-a.date);
posts.forEach((p,i)=>p.grad=G[i%G.length]);
let tpl=fs.readFileSync(path.join(ROOT,'template.html'),'utf8');
let ads={};try{ads=JSON.parse(fs.readFileSync(path.join(ROOT,'content/settings/ads.json'),'utf8'))}catch(e){}
const pubRaw=String(ads.publisher_id||'').trim().replace(/^pub-/,'ca-pub-');
const ON=ads.enabled===true&&/^ca-pub-\d{10,20}$/.test(pubRaw);
if(ads.enabled===true&&!ON)console.warn('Ads are switched on but the publisher ID is missing or invalid, so ads stay off.');
const slot=v=>/^\d{5,20}$/.test(String(v||'').trim())?String(v).trim():'';
const ins=s=>`<ins class="adsbygoogle" style="display:block" data-ad-client="${pubRaw}" data-ad-slot="${s}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
const unit=(cls,v)=>{const s=slot(v);return ON&&s?`<div class="ad ${cls} live">${ins(s)}</div><script>(window.adsbygoogle=window.adsbygoogle||[]).push({});</script>`:''};
const headTag=ON?`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubRaw}" crossorigin="anonymous"></script>`:'';
const feed=ON&&slot(ads.slot_feed)?ins(slot(ads.slot_feed)):'';
tpl=tpl.replace(/<div class="ad top">[^<]*<\/div>/,()=>unit('top',ads.slot_header))
 .replace(/<div class="ad side">[^<]*<\/div>/,()=>unit('side',ads.slot_sidebar))
 .replace('const posts=__POSTS__;',()=>'const posts=__POSTS__;const FEED='+JSON.stringify(feed).replace(/</g,'\\u003c')+';')
 .replace(/if\(i===2\)\{const a=document\.createElement\('div'\);a\.className='ad mid';a\.textContent='[^']*';grid\.appendChild\(a\)\}/,()=>"if(i===2&&FEED){const a=document.createElement('div');a.className='ad mid live';a.innerHTML=FEED;grid.appendChild(a);try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}")
 .replace('</style>',()=>'.ad.live{border:0;height:auto;min-height:0;display:block}</style>')
 .replace('</head>',()=>headTag+'</head>');
const arr=posts.map(p=>[p.category,p.emoji,p.title,p.summary,p.mins+' min',p.grad,p.slug,p.image]);
fs.writeFileSync(path.join(OUT,'index.html'),tpl.replace('__POSTS__',JSON.stringify(arr).replace(/</g,'\\u003c')));
const css=tpl.match(/<style>([\s\S]*?)<\/style>/)[1]+`
.art{max-width:720px;margin:0 auto;padding:40px 20px 20px}
.art .hd{height:220px;border-radius:20px;display:grid;place-items:center;font-size:5rem;background-size:cover;background-position:center;margin-bottom:24px;animation:rise .8s both}
.art h1{font-size:clamp(1.9rem,5vw,2.8rem);margin:8px 0 10px;animation:none}
.prose{font-size:1.1rem}.prose p,.prose ul,.prose ol{margin:0 0 1.2em}.prose h2{font:700 1.5rem system-ui,sans-serif;margin:1.6em 0 .6em}.prose img{max-width:100%;border-radius:12px}.prose a{color:var(--accent);text-decoration:underline}
.back{display:inline-block;margin:20px 0;font:600 .95rem system-ui,sans-serif;color:var(--accent)}
.more{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:16px 0 50px}
.more a{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;font:600 .95rem system-ui,sans-serif;transition:transform .3s}.more a:hover{transform:translateY(-5px)}`;
const header=tpl.match(/<header>[\s\S]*?<\/header>/)[0].replace(/href="#/g,'href="/#');
const footer=tpl.match(/<footer>[\s\S]*?<\/footer>/)[0];
const fmt=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
const js=`const q=s=>document.querySelector(s);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
q('#yr').textContent=new Date().getFullYear();
addEventListener('scroll',()=>{const h=document.documentElement;q('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});
q('#theme').onclick=()=>{const r=document.documentElement;const d=getComputedStyle(r).colorScheme==='dark'||r.dataset.theme==='dark';r.dataset.theme=d?'light':'dark'};`;
posts.forEach(p=>{
  const others=posts.filter(o=>o!==p).slice(0,3);
  const url=SITE+'/posts/'+p.slug+'/';
  const ld=JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,datePublished:p.date.toISOString(),description:p.summary}).replace(/</g,'\\u003c');
  const html=`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)} | ${NAME}</title><meta name="description" content="${esc(p.summary)}">
${SITE?`<link rel="canonical" href="${url}">`:''}<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.summary)}"><meta property="og:type" content="article">
<script type="application/ld+json">${ld}</script><style>${css}</style>${headTag}</head><body>
<div class="progress" id="prog"></div>${header}
<main><article class="art">
<div class="hd" style="background:${p.image?`url('${esc(p.image)}') center/cover`:p.grad}">${p.image?'':p.emoji}</div>
<span class="tag" style="color:var(--accent);font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em">${esc(p.category)}</span>
<h1>${esc(p.title)}</h1>
<div class="meta">${fmt(p.date)} · ${p.mins} min read</div>
${unit('top',ads.slot_header)}
<div class="prose rv">${p.html}</div>
${unit('mid',ads.slot_article)}
<a class="back" href="/#posts">← Back to all articles</a>
<h2 style="font:700 1.2rem system-ui,sans-serif;margin-top:20px">Keep reading</h2>
<div class="more">${others.map(o=>`<a href="/posts/${o.slug}/">${o.emoji} ${esc(o.title)}</a>`).join('')}</div>
</article></main>${footer}<script>${js}</script></body></html>`;
  fs.mkdirSync(path.join(OUT,'posts',p.slug),{recursive:true});
  fs.writeFileSync(path.join(OUT,'posts',p.slug,'index.html'),html);
});
const urls=['',...posts.map(p=>'posts/'+p.slug+'/')];
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>`);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\n${SITE?`Sitemap: ${SITE}/sitemap.xml\n`:''}`);
if(ON)fs.writeFileSync(path.join(OUT,'ads.txt'),'google.com, '+pubRaw.replace('ca-','')+', DIRECT, f08c47fec0942fa0\n');
console.log('Built',posts.length,'posts');

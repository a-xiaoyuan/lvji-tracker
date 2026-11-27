// 履迹 · 专注计时、JD 分析、抽卡复习、回顾与历程
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 专注计时 ========== */
let FOC=JSON.parse(localStorage.getItem('jt_focus')||'null');
function focusToday(){return db.focus.filter(f=>f.date===today()).reduce((t,f)=>t+f.mins,0);}
function renderFocus(){const el=document.getElementById('focus');if(!el)return;
 if(!FOC){const m=focusToday();el.innerHTML=`<div class="fc"><div class="t2" style="margin-bottom:6px">🍅 专注计时${m?` · 今天 ${m} 分钟`:''}</div><div style="display:flex;gap:6px"><button class="btn sm" data-focus="25" style="flex:1;justify-content:center">25 分钟</button><button class="btn sm" data-focus="50" style="flex:1;justify-content:center">50 分钟</button></div></div>`;return;}
 el.innerHTML=`<div class="fc run"><svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15.9" class="bg"/><circle cx="18" cy="18" r="15.9" class="fg" id="focusRing"/></svg><div style="flex:1;min-width:0"><div class="t1" id="focusTime">--:--</div><div class="t2">专注中 · ${FOC.mins} 分钟</div></div><button class="btn sm ghost" data-focus="stop" title="放弃这次专注">✕</button></div>`;tickFocus();}
function tickFocus(){if(!FOC)return;const left=FOC.end-Date.now();if(left<=0)return finishFocus();const t=document.getElementById('focusTime'),r=document.getElementById('focusRing'),txt=`${pad(Math.floor(left/6e4))}:${pad(Math.floor(left/1e3)%60)}`;if(t)t.textContent=txt;if(r)r.style.strokeDashoffset=String(100*(1-left/(FOC.mins*6e4)));document.title=`${txt} 专注中 · 履迹`;}
function finishFocus(){const m=FOC.mins;FOC=null;localStorage.removeItem('jt_focus');document.title='履迹';db.focus.push({date:today(),mins:m});const en=jEntry(today(),true);en.hours=String(Math.round(((+en.hours||0)+m/60)*100)/100);persist();renderFocus();if(['journal','dash','review'].includes(view)&&!openId)render();
 toast(`🍅 完成 ${m} 分钟专注，已记进今天的学习时长`);confetti(80);
 if(db.settings.notify&&typeof Notification!=='undefined'&&Notification.permission==='granted')try{new Notification('专注完成 🍅',{body:`完成 ${m} 分钟专注，起来活动一下吧`});}catch{}}

/* ========== JD 分析 ========== */
const KW=['Java','Go','Golang','Python','C++','C#','Rust','JavaScript','TypeScript','PHP','Kotlin','Scala','Shell','React','Vue','Angular','Node.js','Spring','Spring Boot','Spring Cloud','MyBatis','Dubbo','gRPC','Netty','Django','Flask','FastAPI','Gin','MySQL','PostgreSQL','Oracle','SQL','MongoDB','Redis','Elasticsearch','ClickHouse','HBase','Kafka','RocketMQ','RabbitMQ','消息队列','Zookeeper','Nginx','Linux','Docker','Kubernetes','K8s','Git','CI/CD','Jenkins','微服务','分布式','高并发','高可用','多线程','并发','JVM','计算机网络','TCP','HTTP','操作系统','数据结构','算法','设计模式','系统设计','缓存','性能优化','Hadoop','Spark','Flink','Hive','数据仓库','大模型','LLM','RAG','Agent','LangChain','Prompt','PyTorch','TensorFlow','机器学习','深度学习','NLP','推荐系统','AWS','阿里云','云原生','Serverless','Prometheus','单元测试','自动化测试','英语','沟通','团队协作'];
let JD_MISSING=[];
// 读取如页里的简历（同源 localStorage），按「投递用的简历」名字匹配，找不到就用当前简历
function ruyeDocs(){try{const L=JSON.parse(localStorage.getItem('ruye:documents')||'[]');return Array.isArray(L)?L.filter(x=>x&&x.doc):[];}catch{return [];}}
function ruyeTitle(x){return String(x.doc?.meta?.title||'未命名简历');}
function flatText(o,out=[]){if(typeof o==='string')out.push(o);else if(Array.isArray(o))o.forEach(v=>flatText(v,out));else if(o&&typeof o==='object')for(const [k,v] of Object.entries(o)){if(k==='layout'||k==='id'||k==='updatedAt'||k==='templateId')continue;flatText(v,out);}return out;}
function resumeFor(a){const L=ruyeDocs();if(!L.length)return null;const n=String(a?.resume||'').trim().toLowerCase(),cur=localStorage.getItem('ruye:currentId');
 const x=(n&&L.find(d=>{const t=ruyeTitle(d).toLowerCase();return t===n||t.includes(n)||n.includes(t);}))||L.find(d=>d.id===cur)||L[0];
 return {title:ruyeTitle(x),text:flatText(x.doc).join('\n'),guessed:!n};}
function inResume(k,text){const T=text.toLowerCase(),kl=k.toLowerCase();if(/^[a-z0-9.+#/ -]+$/i.test(k))return new RegExp('(^|[^a-z0-9])'+kl.replace(/[.+#/*?()[\]{}|^$\\]/g,'\\$&')+'(?![a-z0-9+#])','i').test(T);return T.includes(kl);}
function resumeMatchHtml(a,F){const R=resumeFor(a);if(!R)return `<div class="rm t2">还没有在「我的简历」里写简历，写好后这里会显示简历和 JD 的关键词覆盖情况。</div>`;
 const hit=F.filter(k=>inResume(k,R.text)),miss=F.filter(k=>!inResume(k,R.text)),sc=Math.round(hit.length/F.length*100);
 return `<div class="rm"><div class="jdh"><div class="ring2" style="--p:${sc}"><span><b>${sc}</b>%</span></div><div><div class="t1">简历覆盖度 · 《${esc(R.title)}》${R.guessed?'<span class="t2">（没指定简历，用的是当前简历）</span>':''}</div><div class="t2">JD 里的关键词有 ${hit.length}/${F.length} 个出现在简历中${miss.length?'，会的话可以写进简历，过筛更容易':''}</div></div></div>
 ${miss.length?`<div class="quick">${miss.map(k=>`<span class="tag" style="background:#ff2d8714;color:var(--bad)">缺 ${esc(k)}</span>`).join('')}<button class="btn sm" data-act="copymiss" data-k="${esc(miss.join('、'))}">复制缺的词</button></div>`:'<div class="t2" style="color:var(--ok)">✓ JD 关键词都已出现在简历里</div>'}</div>`;}
function kwFind(text){const T=String(text||'').toLowerCase();if(T.length<8)return [];const found=new Set();
 for(const k of new Set([...KW,...db.skills.map(x=>x.name)])){if(!k)continue;const kl=k.toLowerCase();
  if(/^[a-z0-9.+#/ -]+$/i.test(k)){if(new RegExp('(^|[^a-z0-9])'+kl.replace(/[.+#/*?()[\]{}|^$\\]/g,'\\$&')+'(?![a-z0-9+#])','i').test(T))found.add(k);}
  else if(T.includes(kl))found.add(k);}
 const L=[...found];return L.filter(k=>!L.some(o=>o!==k&&o.toLowerCase().includes(k.toLowerCase())));}
function skillFor(k){const b=k.toLowerCase();return db.skills.find(x=>{const a=x.name.toLowerCase();return a===b||(a.length>1&&b.includes(a))||(b.length>1&&a.includes(b));});}
const RED_RULES=[
 {lv:'bad',re:/培训贷|先培训|培训后上岗|0\s*元入学|零元入学|就业保障协议|贷款培训|分期.{0,6}培训/,t:'疑似培训贷 / 先培训后上岗：正规招聘不会让求职者先交钱学技术'},
 {lv:'bad',re:/押金|保证金|服装费|培训费|工牌费|报名费/,t:'要先交钱（押金 / 培训费等）：正规公司不会向求职者收费'},
 {lv:'bad',re:/月入过万|月薪过万|年薪百万/,t:'高薪话术要打问号：问清底薪、绩效占比和发放条件'},
 {lv:'warn',re:/大小周|单休|单双休/,t:'休息制度要问清：大小周 / 单休，往往意味着加班多'},
 {lv:'warn',re:/抗压能力强|吃苦耐劳|狼性|奉献精神|服从安排/,t:'这类词密集出现，通常对应高强度、低回报'},
 {lv:'warn',re:/薪资面议|工资面议|待遇面议/,t:'薪资面议：面试前先问清范围，别面完才谈钱'}];
function redFlags(text){const T=String(text||'');if(T.length<30)return [];return RED_RULES.filter(r=>r.re.test(T)).map(r=>({lv:r.lv,t:r.t}));}
function redFlagsHtml(text){const F=redFlags(text);if(!F.length)return '';
 return `<div>${F.map(f=>`<div class="alert ${f.lv==='bad'?'bad':''}" style="margin-top:6px">🚩 ${esc(f.t)}</div>`).join('')}</div>`;}
function jdHtml(text,a){return jdHtmlCore(text,a)+redFlagsHtml(text);}
function jdHtmlCore(text,a){const F=kwFind(text);if(!F.length)return '<div class="t2" style="margin-top:6px">还没识别出技术关键词，可以多粘贴一些 JD 原文。</div>';
 const rows=F.map(k=>{const x=skillFor(k);return {k,x,lv:x?(+x.level||0):-1};}).sort((a,b)=>b.lv-a.lv);
 const score=Math.round(rows.reduce((t,r)=>t+(r.lv<0?0:Math.min(r.lv,4)/4),0)/rows.length*100);
 JD_MISSING=rows.filter(r=>!r.x).map(r=>r.k);
 const chip=r=>r.lv>=3?`<span class="tag" style="background:#4b48521a;color:var(--ok)">✓ ${esc(r.k)}</span>`:r.lv>=0?`<span class="tag" style="background:#787e8a1a;color:var(--warn)">${esc(r.k)} · ${LVN[r.lv]}</span>`:`<span class="tag">？${esc(r.k)}</span>`;
 return `<div class="jd"><div class="jdh"><div class="ring2" style="--p:${score}"><span><b>${score}</b>%</span></div><div><div class="t1">技能匹配度 · 识别到 ${rows.length} 项要求</div><div class="t2">带 ✓ = 已熟练　标着等级 = 还要加强　带 ？ = 能力树里还没有</div></div></div><div class="quick">${rows.map(chip).join('')}</div>${JD_MISSING.length?`<button class="btn sm" data-act="jdadd" style="margin-top:10px">＋ 把缺的 ${JD_MISSING.length} 项加入能力树</button>`:''}${a?resumeMatchHtml(a,F):''}</div>`;}

/* ========== 抽卡复习（间隔重复） ========== */
let FC=null;
function weakCounts(events){const M=new Map();for(const e of events||[]){for(const w of (e&&e.weak)||[]){if(w)M.set(w,(M.get(w)||0)+1);}}return [...M.entries()].map(([tag,n])=>({tag,n})).sort((a,b)=>b.n-a.n);}
function weakQuestions(Q,tags){const T=new Set(tags||[]);if(!T.size)return [];return (Q||[]).filter(x=>x.e&&((x.e.weak)||[]).some(w=>T.has(w)));}
function startReview(focus){let Q=allQuestions().filter(x=>!x.dup&&db.qmark[x.h]!=='ok'&&(!db.qsrs[x.h]||db.qsrs[x.h].due<=today()));
 if(focus){const tags=weakCounts(allEvents().map(x=>x.e)).slice(0,3).map(x=>x.tag);Q=weakQuestions(Q,tags);if(!Q.length)return toast('弱项相关的到期题目暂时没有：先在面试复盘或模拟面试里把弱项标出来');}
 if(!Q.length)return toast('没有到期的题目，今天的复习完成了 🎉');
 FC={list:Q.sort(()=>Math.random()-.5).slice(0,20),i:0,show:false,stats:{again:0,hard:0,good:0}};document.getElementById('modal').classList.add('on');renderFC();}
function renderFC(){const b=document.getElementById('mbox');b.className='card mbox fcard';const x=FC.list[FC.i];
 if(!x){b.innerHTML=`<div style="text-align:center;padding:18px 10px"><div style="font-size:50px">🎉</div><h3 style="margin:8px 0">这一轮复习完成</h3><p class="t2">😎 记得 ${FC.stats.good}　🤔 模糊 ${FC.stats.hard}　😵 忘了 ${FC.stats.again}</p><p class="t2">记得的题会隔 1、2、4、7、15、30 天再出现，连续记住 5 次自动标为已掌握。</p><button class="btn primary" data-act="mclose" style="margin-top:8px">好的</button></div>`;confetti(120);return;}
 b.innerHTML=`<div class="t2" style="display:flex;gap:8px"><span>第 ${FC.i+1} / ${FC.list.length} 张</span><span style="margin-left:auto">${esc(x.a.company)} · ${esc(x.e.title||EV[x.e.type])}</span></div><div class="fcbar"><i style="width:${FC.i/FC.list.length*100}%"></i></div>
 <div class="fcq">${esc(x.q)}</div>
 ${FC.show?`<div class="f"><label>我的答案要点（自动保存，下次翻面就能看到）</label><textarea class="inp" data-qnote="${x.h}" rows="5" placeholder="写下关键点，比如：RDB 快照、AOF 追加日志、混合持久化……">${esc(db.qnote[x.h]||'')}</textarea></div>
  <div class="quick" style="margin-top:8px">${x.url?ext(safeUrl(x.url),'原题','btn sm'):''}${Q_LINKS.map(([n,,f])=>ext(f(x.q),n,'btn sm')).join('')}<button class="btn sm" data-act="aians" data-h="${x.h}">✨ AI 参考答案</button></div>
  <div class="mfoot"><button class="btn" data-fc="again">😵 忘了 <span class="t2">1</span></button><button class="btn" data-fc="hard">🤔 模糊 <span class="t2">2</span></button><button class="btn primary" data-fc="good">😎 记得 <span style="opacity:.7">3</span></button></div>`
 :`<div class="mfoot" style="justify-content:center"><button class="btn primary" data-fc="show">先在心里回答，然后翻面 ↻ <span style="opacity:.7">空格</span></button></div>`}`;}
function answerFC(k){const x=FC.list[FC.i];if(k==='show'){FC.show=true;return renderFC();}
 const r=db.qsrs[x.h]||{box:0},G=[1,2,4,7,15,30],D=n=>dstr(new Date(Date.now()+n*864e5));
 if(k==='again'){r.box=0;r.due=D(1);}else if(k==='hard'){r.due=D(2);}else{r.box=Math.min(5,r.box+1);r.due=D(G[r.box]);if(r.box>=5)db.qmark[x.h]='ok';}
 db.qsrs[x.h]=r;FC.stats[k]++;FC.i++;FC.show=false;persist();renderFC();}

/* ========== 回顾与历程 ========== */
let rvU='week',rvO=0;
const rvLab=()=>rvU==='week'?(rvO?'上周':'本周'):(rvO?'上月':'本月');
function pRange(u,o){const t=new Date();t.setHours(0,0,0,0);let a,b;if(u==='week'){a=new Date(t);a.setDate(t.getDate()-((t.getDay()+6)%7)-7*o);b=new Date(a);b.setDate(a.getDate()+6);}else{a=new Date(t.getFullYear(),t.getMonth()-o,1);b=new Date(a.getFullYear(),a.getMonth()+1,0);}return [dstr(a),dstr(b)];}
function pStats([a,b]){const inR=d=>!!d&&d>=a&&d<=b,J=db.journal.filter(x=>inR(x.date)),M=J.filter(x=>x.mood);
 return {apps:db.apps.filter(x=>x.status!=='wish'&&inR(x.appliedAt)).length,
  iv:allEvents().filter(({e:v})=>v.type==='interview'&&inR((v.at||'').slice(0,10))).length,
  offers:db.apps.filter(x=>x.history.some(h=>h.to==='offer'&&inR(h.at.slice(0,10)))).map(x=>x.company),
  days:J.filter(x=>jActive(x.date)).length,hours:+J.reduce((t,x)=>t+(+x.hours||0),0).toFixed(1),
  focus:db.focus.filter(f=>inR(f.date)).reduce((t,f)=>t+f.mins,0),
  habits:Object.fromEntries(db.habits.map(h=>[h.id,J.filter(x=>x.habits?.[h.id]).length])),
  mood:M.length?M.reduce((t,x)=>t+x.mood,0)/M.length:0,
  moves:db.apps.flatMap(x=>x.history.filter(h=>h.from&&inR(h.at.slice(0,10))).map(h=>({a:x,h}))).sort((x,y)=>y.h.at.localeCompare(x.h.at))};}
function posterStats(d,qn){const apps=d.apps||[];const sent=apps.filter(a=>a.status!=='wish'&&a.appliedAt);
 let iv=0,ts=0;for(const a of apps)for(const e of a.events||[]){if(e.type==='interview')iv++;if(e.type==='test')ts++;}
 const start=(d.settings&&d.settings.startDate)||apps.map(a=>a.appliedAt).filter(Boolean).sort()[0]||today();
 return {days:dayDiff(today(),start)+1,sent:sent.length,iv,ts,qn:qn||0,offers:apps.filter(a=>a.status==='offer').length,ms:(d.milestones||[]).slice(-3).map(m=>({d:m.date,t:m.title}))};}
function openPoster(){const S=posterStats(db,allQuestions().length);
 aiModal('🎨 我的求职季',`<canvas id="posterCv" width="720" height="1080" style="width:100%;border-radius:12px;display:block"></canvas><div class="mfoot"><button class="btn" data-act="mclose">关闭</button><button class="btn primary" data-act="posterdown">⬇ 保存图片</button></div>`);
 drawPoster(S);}
function drawPoster(S){const cv=document.getElementById('posterCv');if(!cv)return;const g=cv.getContext('2d');
 const gr=g.createLinearGradient(0,0,720,1080);gr.addColorStop(0,'#1b1b2f');gr.addColorStop(1,'#3a2b5c');g.fillStyle=gr;g.fillRect(0,0,720,1080);
 g.fillStyle='#ffd166';g.beginPath();g.arc(628,110,140,0,7);g.fill();g.fillStyle='#23233c';g.beginPath();g.arc(672,84,128,0,7);g.fill();
 const F=(w,s)=>`${w} ${s}px "PingFang SC","Microsoft YaHei",sans-serif`;
 g.fillStyle='#ffffff';g.font=F(900,64);g.fillText('我的求职季',56,140);
 g.fillStyle='#c9c4e5';g.font=F(400,28);g.fillText(`第 ${S.days} 天 · 还在路上，也一直在进步`,56,196);
 const cells=[['投递',S.sent],['面试',S.iv],['笔试',S.ts],['攒下的题',S.qn],['Offer',S.offers],['坚持天数',S.days]];
 cells.forEach((c,i)=>{const x=56+(i%3)*216,y=280+Math.floor(i/3)*196;g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x,y,192,156);g.fillStyle='#ffd166';g.font=F(900,60);g.fillText(String(c[1]),x+24,y+80);g.fillStyle='#c9c4e5';g.font=F(400,26);g.fillText(c[0],x+24,y+124);});
 g.fillStyle='#ffffff';g.font=F(700,32);g.fillText('这一路的高光时刻',56,724);
 g.fillStyle='#e8e4f5';g.font=F(400,26);
 const lines=S.ms.length?S.ms.map(m=>`${m.d}  ${m.t}`):['（去「回顾与历程」里记下你的第一个里程碑）'];
 lines.forEach((t,i)=>g.fillText(t.slice(0,25),56,780+i*48));
 g.fillStyle='#8f89ad';g.font=F(400,24);g.fillText(`履迹 · ${today()}`,56,1024);}
function milestones(){const L=[{d:huntStart(),e:'🚀',t:'开始求职'}];
 const sent=db.apps.filter(a=>a.status!=='wish'&&a.appliedAt).sort((a,b)=>a.appliedAt.localeCompare(b.appliedAt));
 if(sent[0])L.push({d:sent[0].appliedAt,e:'📮',t:'第一次投递：'+sent[0].company});
 for(const n of [10,30,50,100,200])if(sent[n-1])L.push({d:sent[n-1].appliedAt,e:'📈',t:`累计投递 ${n} 个`});
 const iv=allEvents().filter(({e:v})=>v.type==='interview'&&v.at).sort((x,y)=>x.e.at.localeCompare(y.e.at))[0];if(iv)L.push({d:iv.e.at.slice(0,10),e:'🎤',t:'第一次面试：'+iv.a.company});
 for(const a of db.apps){const h=a.history.find(h=>h.to==='offer');if(h)L.push({d:h.at.slice(0,10),e:'🎉',t:`拿到 ${a.company} 的 Offer`});}
 const fj=db.journal.filter(x=>jActive(x.date)).map(x=>x.date).sort()[0];if(fj)L.push({d:fj,e:'✎',t:'写下第一篇成长日记'});
 const tf=db.focus.reduce((t,f)=>t+f.mins,0);if(tf>=600){let acc=0;for(const f of db.focus.slice().sort((a,b)=>a.date.localeCompare(b.date))){acc+=f.mins;if(acc>=600){L.push({d:f.date,e:'🍅',t:'累计专注满 10 小时'});break;}}}
 for(const m of db.milestones)L.push({d:m.date,e:'⭐',t:m.title,id:m.id});
 return L.sort((a,b)=>b.d.localeCompare(a.d));}
function vReview(){const R=pRange(rvU,rvO),c=pStats(R),p=pStats(pRange(rvU,rvO+1)),lab=rvLab();
 const dl=(x,y)=>x===y?'<span class="t2">与上期持平</span>':`<span style="color:${x>y?'var(--ok)':'var(--bad)'};font-weight:600">${x>y?'↑':'↓'} ${+Math.abs(x-y).toFixed(1)}</span> <span class="t2">较上期</span>`;
 const end=R[1]<today()?R[1]:today(),days=[];for(const d=new Date(R[0]+'T00:00');dstr(d)<=end;d.setDate(d.getDate()+1))days.push(dstr(d));
 const pts=days.map((d,i)=>{const x=jEntry(d);return x&&x.mood?{i,m:x.mood}:null;}).filter(Boolean);
 const W=560,H=150,X=i=>days.length>1?34+i/(days.length-1)*(W-50):W/2,Y=m=>H-16-(m-1)/4*(H-34),line=pts.map(q=>X(q.i).toFixed(1)+','+Y(q.m).toFixed(1)).join(' ');
 const moodSvg=pts.length?`<svg viewBox="0 0 ${W} ${H}" class="mood"><defs><linearGradient id="mg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff2d87" stop-opacity=".32"/><stop offset="1" stop-color="#ff2d87" stop-opacity="0"/></linearGradient></defs>${[1,2,3,4,5].map(m=>`<line x1="34" x2="${W-16}" y1="${Y(m)}" y2="${Y(m)}" class="gl"/><text x="4" y="${Y(m)+5}" font-size="13">${MOODS[m-1]}</text>`).join('')}${pts.length>1?`<polygon points="${X(pts[0].i)},${H-16} ${line} ${X(pts.at(-1).i)},${H-16}" fill="url(#mg)"/><polyline points="${line}" class="ml"/>`:''}${pts.map(q=>`<circle cx="${X(q.i)}" cy="${Y(q.m)}" r="4.5" class="md"><title>${days[q.i]} ${MOODS[q.m-1]}</title></circle>`).join('')}</svg>`:'<div class="empty">这段时间还没记录心情。在成长日记里点一下表情就行。</div>';
 const rv=db.reviews[rvU+':'+R[0]]||{},nd=days.length||1;
 return `<div class="tools"><div class="seg">${[['week',0,'本周'],['week',1,'上周'],['month',0,'本月'],['month',1,'上月']].map(([u,o,n])=>`<button data-rvp="${u}|${o}" class="${rvU===u&&rvO===o?'on':''}">${n}</button>`).join('')}</div><span class="t2">${R[0]} ~ ${R[1]}</span><span style="flex:1"></span><button class="btn sm" data-act="aireview">✨ AI 总结${lab}</button><button class="btn sm" data-act="copyreview">📋 复制${lab}总结</button></div>
 <div class="grid kpis">
  <div class="card kpi"><div class="l">投递</div><div class="v">${c.apps}</div><div class="h">${dl(c.apps,p.apps)}</div></div>
  <div class="card kpi"><div class="l">面试</div><div class="v">${c.iv}</div><div class="h">${dl(c.iv,p.iv)}</div></div>
  <div class="card kpi"><div class="l">记录天数</div><div class="v">${c.days}</div><div class="h">${dl(c.days,p.days)}</div></div>
  <div class="card kpi"><div class="l">学习小时</div><div class="v">${c.hours}</div><div class="h">${dl(c.hours,p.hours)}</div></div>
  <div class="card kpi"><div class="l">专注分钟</div><div class="v">${c.focus}</div><div class="h">${dl(c.focus,p.focus)}</div></div></div>
 ${c.offers.length?`<div class="alert info" style="margin-top:16px">🎉 ${lab}拿到了 ${c.offers.map(esc).join('、')} 的 Offer！</div>`:''}
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>心情曲线<span class="m">${c.mood?'平均 '+MOODS[Math.round(c.mood)-1]:''}</span></h3>${moodSvg}</div>
  <div class="card sec"><h3>打卡完成<span class="m">共 ${days.length} 天</span></h3>${db.habits.map(h=>`<div class="chl"><span>${h.icon} ${esc(h.name)}</span><div class="bar"><i style="width:${c.habits[h.id]/nd*100}%;background:linear-gradient(90deg,#4b4852,#959ba6)"></i></div><span class="r">${c.habits[h.id]} 天</span></div>`).join('')||'<div class="empty">还没有打卡项</div>'}</div></div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>✍️ ${lab}复盘<span class="m">自动保存</span></h3><div class="fg">
   <div class="f full"><label>做得好的 👍</label><textarea class="inp" data-rv="good" rows="3">${esc(rv.good)}</textarea></div>
   <div class="f full"><label>需要改进的 🔧</label><textarea class="inp" data-rv="bad" rows="3">${esc(rv.bad)}</textarea></div>
   <div class="f full"><label>下阶段计划 🎯</label><textarea class="inp" data-rv="next" rows="3">${esc(rv.next)}</textarea></div></div></div>
  <div class="card sec"><h3>进度变化<span class="m">${c.moves.length} 次</span></h3><div style="max-height:430px;overflow:auto">${c.moves.length?c.moves.map(({a,h})=>`<div class="ev-row" data-open="${a.id}"><div style="flex:1;min-width:0"><div class="t1">${esc(a.company)} <span class="t2">${esc(a.role)}</span></div><div class="t2">${h.at.slice(5,16)} · ${SM[h.from]?.n||''} → <b style="color:${SM[h.to]?.c}">${SM[h.to]?.n||''}</b></div></div></div>`).join(''):'<div class="empty">这段时间没有进度变化</div>'}</div></div></div>
 ${failCard()}
 ${resumeCard()}
 <div class="card sec" style="margin-top:16px"><h3>🧭 我的历程<span class="m">重要的节点会自动记下，也可以自己添加</span></h3>
  <div class="tools"><input type="date" class="inp" id="msDate" value="${today()}" max="${today()}"><input class="inp" id="msTitle" placeholder="比如：第一次独立做完一个项目、拿到第一个内推……" style="flex:1;min-width:220px"><button class="btn sm primary" data-act="addms">＋ 添加</button><button class="btn sm" data-act="poster">🎨 生成求职季海报</button></div>
  <div class="tl">${milestones().map((m,i)=>`<div class="it" data-e="${m.e}" style="--n:${i}"><div class="t1">${esc(m.t)}${m.id?` <a href="#" data-delms="${m.id}" class="t2" title="删除" style="font-weight:400">✕</a>`:''}</div><div class="t2">${m.d}</div></div>`).join('')}</div></div>`;}


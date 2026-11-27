// 履迹 · 常量、数据结构与修复、多窗口合并、打击感控件
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 常量 ========== */
const ST=[
 {k:'wish',n:'待投递',c:'#c9ced6'},{k:'applied',n:'已投递',c:'#959ba6'},{k:'test',n:'笔试/测评',c:'#787e8a'},
 {k:'interview',n:'面试中',c:'#5f5a63'},{k:'hr',n:'HR 面',c:'#4b4852'},{k:'offer',n:'Offer',c:'#ff2d87'},
 {k:'rejected',n:'未通过',c:'#dfe2e7'},{k:'dropped',n:'已放弃',c:'#dfe2e7'}];
const SM=Object.fromEntries(ST.map(s=>[s.k,s]));
const CH=['Boss直聘','内推','官网','拉勾','猎聘','牛客','校招','猎头','其他'];
const EV={interview:'面试',test:'笔试/测评',followup:'跟进',offer:'Offer 沟通',note:'备注'};
const PRI={1:['高','#ff2d87'],2:['中','#787e8a'],3:['低','#c9ced6']};
const ACTIVE=['applied','test','interview','hr'];
const KEY='jobtracker_v1',API='http://127.0.0.1:47321/api/jobtracker',RUYE='http://127.0.0.1:47321/';
const enc=encodeURIComponent;
// 公司相关的快捷入口（用公司名 / 岗位名搜索）
const COMPANY_LINKS=[
 ['Boss直聘 搜岗位','💼',a=>`https://www.zhipin.com/web/geek/job?query=${enc(a.company+' '+(a.role||''))}`],
 ['看准网 看评价','⭐',a=>`https://www.kanzhun.com/search?query=${enc(a.company)}&type=1`],
 ['牛客 搜面经','📝',a=>`https://www.nowcoder.com/search/all?query=${enc(a.company+' 面经')}`],
 ['天眼查 查公司','🏢',a=>`https://www.tianyancha.com/search?key=${enc(a.company)}`],
 ['必应搜索','🔎',a=>`https://www.bing.com/search?q=${enc(a.company+' '+(a.role||'')+' 面试')}`]];
// 题目的练习入口
const Q_LINKS=[
 ['力扣','LC',q=>`https://leetcode.cn/problemset/?search=${enc(q)}`],
 ['牛客','牛',q=>`https://www.nowcoder.com/search/all?query=${enc(q)}`],
 ['搜答案','搜',q=>`https://www.bing.com/search?q=${enc(q+' 面试题')}`]];
const PORTALS=[
 ['力扣 Hot 100','🔥','#959ba6','最常考的 100 道算法题','https://leetcode.cn/studyplan/top-100-liked/'],
 ['剑指 Offer','🎯','#ff2d87','面试经典题单','https://leetcode.cn/studyplan/coding-interviews/'],
 ['CodeTop','📈','#4b4852','按公司统计的高频题','https://codetop.cc/home'],
 ['牛客面试题库','📚','#ff2d87','八股文与面经','https://www.nowcoder.com/exam/interview']];

const MOODS=['😫','😕','😐','🙂','😄'];
const DEF_HABITS=[{id:'h1',name:'刷题',icon:'🧩'},{id:'h2',name:'投递',icon:'📮'},{id:'h3',name:'背八股',icon:'📖'},{id:'h4',name:'运动',icon:'🏃'}];
const REL=['内推人','HR','面试官','学长学姐','导师','同学朋友','猎头','其他'];
const LVN=['未评','了解','会用','熟练','精通','专家'];
const LV=[1,2,3,4,5].map(i=>[i,i+' · '+LVN[i]]);
const BQ=['介绍一个最有挑战的项目','遇到的最大困难及如何解决','和队友意见不合怎么办','一次失败的经历和收获','如何快速学习一门新技术','最有成就感的一件事','压力大、时间紧时怎么完成任务','主动推动过的改进','为什么选择我们公司','你的优点和缺点','未来 3-5 年的职业规划','团队协作 / 带人的经历'];
const SKILL_PRESET=[['数据结构与算法','计算机基础'],['计算机网络','计算机基础'],['操作系统','计算机基础'],['Java','编程语言'],['Spring Boot','框架'],['MySQL','数据库'],['Redis','数据库'],['消息队列','中间件'],['Linux','工程工具'],['Git','工程工具'],['Docker','工程工具'],['系统设计','架构']];

const DEF_TPL=[
 {id:'t1',title:'Boss 打招呼',body:'您好！我是{我}，对贵公司的{岗位}岗位很感兴趣。我熟悉{技能}，做过相关项目，简历已附上，期待有机会进一步沟通，谢谢！'},
 {id:'t2',title:'请求内推',body:'{联系人}你好！冒昧打扰，看到{公司}在招{岗位}，和我的方向很匹配。方便的话能帮我内推一下吗？简历我发你，需要的话我再按岗位调整。非常感谢！'},
 {id:'t3',title:'投递后跟进',body:'您好，我是{我}，{投递日期}投递了{公司}的{岗位}岗位，想了解一下目前的进展。我对这个岗位非常感兴趣，如需补充材料随时联系我，谢谢！'},
 {id:'t4',title:'面试后感谢',body:'{联系人}您好，感谢今天抽时间面试我。聊完之后我对{公司}的{岗位}更感兴趣了，期待后续消息，谢谢！'},
 {id:'t5',title:'询问面试结果',body:'您好，我是{我}，前几天参加了{公司}{岗位}的面试，想冒昧问一下结果出来了吗？谢谢您！'},
 {id:'t6',title:'婉拒 Offer',body:'{联系人}您好，非常感谢{公司}给我{岗位}的 Offer 和这段时间的沟通。经过慎重考虑，我决定选择另一个更贴合自己规划的机会，这次只能遗憾婉拒。希望以后还有合作的机会，祝一切顺利！'}];
const TPL_VARS=['{公司}','{岗位}','{联系人}','{我}','{投递日期}','{技能}'];

/* ========== 数据 ========== */
function newApp(p={}){return Object.assign({id:uid(),company:'',role:'',city:'',salary:'',channel:'Boss直聘',status:'applied',priority:2,appliedAt:today(),due:'',link:'',site:'',resume:'',contact:'',notes:'',events:[],history:[],offer:{base:'',months:'',bonus:'',stock:'',other:'',wlb:3,growth:3,deadline:''},updatedAt:Date.now()},p);}
function normalize(d){d=d&&typeof d==='object'?d:{};d.apps=Array.isArray(d.apps)?d.apps.filter(a=>a&&typeof a==='object').map(a=>{const n=newApp(a);if(!n.id)n.id=uid();n.offer=Object.assign({wlb:3,growth:3},a.offer&&typeof a.offer==='object'?a.offer:{});n.events=(Array.isArray(a.events)?a.events:[]).filter(e=>e&&typeof e==='object').map(e=>Object.assign({rating:0,questions:'',review:'',place:'',done:false},e,{id:e.id||uid()}));n.history=Array.isArray(a.history)?a.history:[];
 // 坏数据兜底：字段类型不对、状态不认识、日期不合法时修正，避免整页白屏
 for(const f of ['company','role','city','salary','channel','link','site','resume','contact','notes','due'])if(typeof n[f]!=='string')n[f]=n[f]==null?'':String(n[f]);
 if(!ST.some(s=>s.k===n.status))n.status='applied';if(!/^\d{4}-\d{2}-\d{2}$/.test(n.appliedAt||''))n.appliedAt=today();return n;}):[];
 d.settings=Object.assign({weekGoal:10,notify:false,startDate:'',profile:{}},d.settings||{});d.qmark=d.qmark||{};
 d.journal=Array.isArray(d.journal)?d.journal:[];d.habits=Array.isArray(d.habits)?d.habits:DEF_HABITS.map(h=>({...h}));d.skills=Array.isArray(d.skills)?d.skills:[];d.stories=Array.isArray(d.stories)?d.stories:[];d.people=Array.isArray(d.people)?d.people:[];d.focus=Array.isArray(d.focus)?d.focus:[];d.reviews=d.reviews||{};d.milestones=Array.isArray(d.milestones)?d.milestones:[];d.qsrs=d.qsrs||{};d.mocks=Array.isArray(d.mocks)?d.mocks:[];d.subs=Array.isArray(d.subs)?d.subs:[];d.chat=Array.isArray(d.chat)?d.chat:[];d.qnote=d.qnote||{};d.tpls=Array.isArray(d.tpls)?d.tpls:DEF_TPL.map(t=>({...t}));
 if(!d.settings.v1SamplesCleaned){const n=d.apps.length;d.apps=d.apps.filter(a=>!(a.sample||/（示例）$/.test(a.company)||/^示例公司 [A-Z]$/.test(a.company)));d.settings.v1SamplesCleaned=true;if(d.apps.length!==n){d.qmark={};d._cleaned=true;}}
 return d;}
/* 两个履迹窗口同时改了数据时合并（theirs = 文件里别的窗口存的，mine = 本窗口的）：
   - 带 id 的列表（投递、人脉、故事……）按 id 合并，两边都有的取 updatedAt 新的，一样新就取本窗口的；
   - 同一条收件箱记录（inboxId 相同）只保留一份，避免两个窗口各收一次；
   - 对象（设置、题目掌握情况……）按键合并，本窗口的优先；没有 id 的列表用本窗口的。
   删除不会同步：一边删掉、另一边还在的条目会被保留，宁可多一条也不丢。 */
function mergeDb(theirs,mine){
 theirs=theirs&&typeof theirs==='object'?theirs:{};mine=mine&&typeof mine==='object'?mine:{};
 const out={...theirs};
 for(const k of new Set([...Object.keys(theirs),...Object.keys(mine)])){
  const t=theirs[k],m=mine[k];
  if(m===undefined){out[k]=t;continue;}if(t===undefined){out[k]=m;continue;}
  if(Array.isArray(t)&&Array.isArray(m)){
   const byId=x=>x&&typeof x==='object'&&x.id!=null;
   if(!(t.every(byId)&&m.every(byId))){out[k]=m;continue;}
   const map=new Map(t.map(x=>[x.id,x]));
   for(const x of m){const y=map.get(x.id);map.set(x.id,!y||(x.updatedAt||0)>=(y.updatedAt||0)?x:y);}
   let L=[...map.values()];
   if(k==='apps'){const seen=new Map();L=L.filter(a=>{if(!a.inboxId)return true;const o=seen.get(a.inboxId);if(!o){seen.set(a.inboxId,a);return true;}return false;});}
   out[k]=L;
  }else if(t&&m&&typeof t==='object'&&typeof m==='object'&&!Array.isArray(t)&&!Array.isArray(m))out[k]={...t,...m};
  else out[k]=m;
 }
 return out;}
/* ========== 打击感控件：把页面里的按钮、勾选框、开关、滑块、进度条换成 sakuga-vfx ========== */
const SKFX=window.SakugaFX||null;
function skTint(){if(!SKFX)return;const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim(),dark=document.documentElement.dataset.theme==='dark';
 Object.assign(SKFX.P,{fill:dark?'#2c2a31':'#fdfdfd',shade:dark?'#3b3842':'#d5d9e0',line:v('--ink')||'#16161d',accent:v('--accent')||'#ff2d87',ink:v('--ink')||'#16161d',sfx:[dark?'#000':'#16161d',v('--accent')||'#ff2d87']});}
function skCopy(from,to){for(const a of from.attributes)if(a.name!=='type')to.setAttribute(a.name,a.value);}
function skBtn(b){const s=document.createElement('sakuga-button');skCopy(b,s);if(!b.classList.contains('primary'))s.setAttribute('variant','secondary');while(b.firstChild)s.appendChild(b.firstChild);b.replaceWith(s);}
function skChk(i){const sw=!!i.dataset.set,s=document.createElement(sw?'sakuga-toggle':'sakuga-checkbox');skCopy(i,s);s.classList.remove('chk');
 const lab=i.parentElement&&i.parentElement.tagName==='LABEL'?i.parentElement:null;
 if(!lab){s.setAttribute('label',i.title||'勾选');i.replaceWith(s);return;}
 const d=document.createElement('div');skCopy(lab,d);d.classList.add('skrow');i.replaceWith(s);
 if(sw)s.setAttribute('label',lab.textContent.trim());else{while(s.nextSibling)s.appendChild(s.nextSibling);d.classList.remove('skrow');}
 while(lab.firstChild)d.appendChild(lab.firstChild);lab.replaceWith(d);}
function skRange(r){const s=document.createElement('sakuga-slider');skCopy(r,s);s.setAttribute('unit','');if(!s.getAttribute('label'))s.setAttribute('label',r.title||'评分');r.replaceWith(s);}
const SKP=new Map();
function skProg(bar){const i=bar.querySelector('i'),v=Math.max(0,Math.min(1,(parseFloat(i&&i.style.width)||0)/100)),key=bar.classList[0]||'bar',s=document.createElement('sakuga-progress');
 s.setAttribute('label',bar.getAttribute('title')||'进度');s.setAttribute('done-label','达成 ✓');bar.replaceWith(s);
 const prev=SKP.get(key);SKP.set(key,v);if(!s.set)return;
 if(prev===undefined||v<=prev)s.set(v>=1&&prev>=1?0.999:v,true);else{s.set(prev,true);s.set(v);}}
function skSweep(root){if(!SKFX||!root.querySelectorAll)return;
 for(const b of root.querySelectorAll('button.btn'))skBtn(b);
 for(const i of root.querySelectorAll('input.chk[type=checkbox]'))skChk(i);
 for(const r of root.querySelectorAll('input[type=range]'))skRange(r);
 for(const p of root.querySelectorAll('.goal .bar,.tbar,.fcbar'))skProg(p);}
// 关键动作的拟声字：x,y 是视口坐标
function skHit(x,y,word='pon',big){if(!SKFX||SKFX.calm)return;const X=x+scrollX,Y=y+scrollY;
 SKFX.burst(X,Y,{r:big?80:44,spikes:big?17:13,life:.4});SKFX.shards(X,Y,{n:big?10:6,speed:big?240:170,size:big?8:6,arc:6.28,grav:300,life:.8});
 const h=big?75:52;SKFX.sfx(word,Math.min(X+12,scrollX+innerWidth-h*1.3),Math.max(Y-(big?70:52),scrollY+h),{size:big?150:104,rot:-.12,life:.9});}
// 普通（次要）按钮点击：在点击处补一个小冲击星芒
document.addEventListener('pointerup',e=>{if(!SKFX||SKFX.calm)return;const b=e.target.closest&&e.target.closest('sakuga-button[variant=secondary]');if(!b||b.disabled)return;SKFX.burst(e.clientX+scrollX,e.clientY+scrollY,{r:22,spikes:11,life:.3});},true);
// 原生勾选框会先发 input 再发 change，控件库只发 change：补一个 input，让原来的处理逻辑照常工作
document.addEventListener('change',e=>{if(/^SAKUGA-(TOGGLE|CHECKBOX)$/.test(e.target.tagName))e.target.dispatchEvent(new Event('input',{bubbles:true}));},true);
if(SKFX){skTint();skSweep(document.body);
 new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches&&n.matches('button.btn'))skBtn(n);else if(n.matches&&n.matches('input.chk[type=checkbox]'))skChk(n);else skSweep(n);}}).observe(document.body,{childList:true,subtree:true});
 new MutationObserver(()=>{skTint();ruyeSkin(document.querySelector('#ruyeBox iframe'));}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});}
let db; // 在所有工具函数定义之后再载入，见底部「启动」
let saveT;function flushSave(){clearTimeout(saveT);saveT=null;localStorage.setItem(KEY,JSON.stringify(db));}
function persist(){db.savedAt=Date.now();if(!saveT)saveT=setTimeout(flushSave,300);schedulePush();}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>dstr(new Date());
const nowLocal=()=>{const d=new Date();return `${dstr(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;};
const dayDiff=(a,b)=>Math.round((new Date(a+'T00:00')-new Date(b+'T00:00'))/864e5);
const WK='日一二三四五六';
const appById=id=>db.apps.find(a=>a.id===id);
const safeUrl=u=>{u=String(u||'').trim();if(!u)return'';if(!/^https?:\/\//i.test(u))u='https://'+u;try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:'';}catch{return'';}};
const ext=(href,label,cls='btn sm',title='')=>href?`<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${title?`title="${esc(title)}"`:''}>${label}</a>`:'';
function nextEvent(a){const n=nowLocal();return a.events.filter(e=>!e.done&&e.at&&e.at>=n).sort((x,y)=>x.at.localeCompare(y.at))[0];}
function allEvents(){const r=[];for(const a of db.apps)for(const e of a.events)r.push({a,e});return r;}
function annual(o){if(!o)return 0;return (+o.base||0)*(+o.months||12)+(+o.bonus||0)+(+o.stock||0)+(+o.other||0);}
const fmtK=n=>n>=10000?(n/10000).toFixed(n%10000?1:0)+' 万':n.toLocaleString();
function touch(a){a.updatedAt=Date.now();persist();}
function logStatus(a,from,to){a.history.push({at:nowLocal().replace('T',' '),from,to});}
function hashStr(s){let h=0;for(const c of s)h=(h*31+c.codePointAt(0))|0;return 'q'+(h>>>0).toString(36);}


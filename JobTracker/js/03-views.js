// 履迹 · 各页面渲染：概览、看板、列表、日程、Offer、题库、设置
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 渲染 ========== */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastView=null,enterT;
function countUp(){if(RM)return;document.querySelectorAll('#view .kpi .v,#view .goal .big').forEach(el=>{const tn=el.firstChild;if(!tn||tn.nodeType!==3)return;const t=tn.data.trim();if(!/^\d+(\.\d+)?$/.test(t))return;const to=+t,dec=(t.split('.')[1]||'').length,t0=performance.now(),D=900;
 const step=now=>{const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);tn.data=(to*e).toFixed(dec);if(k<1)requestAnimationFrame(step);};tn.data=(0).toFixed(dec);requestAnimationFrame(step);});}
function confetti(n=140){if(RM)return;skHit(innerWidth/2,innerHeight/2,'don',true);return;const c=document.createElement('canvas');c.id='confetti';c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;document.body.appendChild(c);setTimeout(()=>c.remove(),3000);const g=c.getContext('2d');g.scale(devicePixelRatio,devicePixelRatio);
 const C=['#ff2d87','#959ba6','#ff2d87','#ff2d87','#4b4852','#959ba6'];const P=Array.from({length:n},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,s:Math.random()*7+4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:C[Math.random()*C.length|0]}));
 const t0=performance.now();(function f(now){g.clearRect(0,0,innerWidth,innerHeight);const t=(now-t0)/1000;for(const p of P){p.vy+=.38;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.globalAlpha=Math.max(0,1-t/2.4);g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore();}if(t<2.4)requestAnimationFrame(f);else c.remove();})(t0);}
let rsT;function renderSoon(){clearTimeout(rsT);rsT=setTimeout(render,350);}
// 兜底：某个页面出错时只显示提示，不让整个履迹白屏，其他页面照常能用
function render(){try{renderInner();}catch(err){console.error(err);const v=document.getElementById('view');if(v)v.innerHTML=`<div class="card" style="padding:22px;max-width:560px"><h3 style="margin:0 0 8px">😵 这个页面出了点问题</h3><div class="t2" style="margin-bottom:12px">你的数据没有丢，其他页面照常能用。可以先切到别的页面，或者把下面这行发给开发者：</div><code style="display:block;white-space:pre-wrap;font-size:12px;background:#0000000d;padding:8px 10px;border-radius:8px">${esc(view+'：'+(err&&err.message||err))}</code><div style="margin-top:14px;display:flex;gap:8px"><button class="btn primary" data-view="dash">回到概览</button><button class="btn" data-view="settings">设置与备份</button></div></div>`;}}
function renderInner(){
 const upcoming=allEvents().filter(({e})=>!e.done&&e.at&&e.at.slice(0,10)>=today()).length;
 const cnt={agent:agentAlerts(AG.d,Date.now()).length,people:db.people.filter(p=>p.nextAt&&p.nextAt<=today()).length,list:db.apps.length,cal:upcoming,offer:db.apps.filter(a=>a.status==='offer').length,bank:allQuestions().filter(x=>db.qmark[x.h]!=='ok').length};
 document.getElementById('nav').innerHTML=VIEWS.filter(([k])=>k!=='agent'||agShow()||view==='agent').map(([k,n])=>({dash:'<div class="navg">求职</div>',resume:'<div class="navg">我自己</div>',agent:'<div class="navg">工具</div>',settings:'<div class="navg"></div>'}[k]||'')+`<button data-view="${k}" title="${n}" class="${view===k?'on':''}">${svg(k)}${n}${cnt[k]?`<span class="cnt">${cnt[k]}</span>`:''}</button>`).join('');
 const [t,s]={dash:['概览',greet()],board:['看板','拖动卡片即可更新进度'],list:['全部投递',`共 ${db.apps.length} 条记录`],cal:['面试日程','所有笔试、面试与跟进安排'],offer:['Offer 对比','按年包、成长和生活平衡综合比较'],bank:['面试题库','面试里被问到的题，点一下就能去练'],tpl:['话术模板','打招呼、内推、跟进、感谢信，一键填好公司和岗位后复制'],resume:['我的简历',''],review:['回顾与历程','看看这段时间的自己：数据、心情、复盘和里程碑'],journal:['成长日记','每天一分钟，记下努力的自己'],skills:['能力树','会什么、差什么、先补什么'],stories:['面试故事库','用 STAR 法则准备行为面试，被问到时不慌'],people:['人脉','帮过你、能帮你的人，到时间提醒你联系'],agent:['Agent 额度','各个 AI 编程助手的额度和用量，数据只在本机读取'],settings:['设置与备份','数据安全、提醒和偏好']}[view];
 document.getElementById('title').textContent=t;document.getElementById('subtitle').textContent=s;
 document.getElementById('topAdd').hidden=!['dash','board','list','cal'].includes(view);if(view==='settings'){setTimeout(aiStatusFill,50);setTimeout(extStatusFill,60);} // 只在求职相关页面显示添加按钮
 const v=document.getElementById('view');
 const entering=view!==lastView;lastView=view;
 const full=view==='resume';document.querySelector('main').classList.toggle('full',full);document.querySelector('.app').classList.toggle('mini',full);if(full){showRuye();return;}
 v.innerHTML=({dash:vDash,board:vBoard,list:vList,cal:vCal,offer:vOffer,bank:vBank,tpl:vTpl,journal:vJournal,review:vReview,skills:vSkills,stories:vStories,people:vPeople,agent:vAgent,settings:vSettings})[view]();
 if(entering&&!RM){v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter');clearTimeout(enterT);enterT=setTimeout(()=>v.classList.remove('enter'),1600);countUp();}
 for(const [id,flag] of [['q','_focus'],['qb','_focusB']]){const i=document.getElementById(id);if(i&&F[flag]){i.focus();i.setSelectionRange(i.value.length,i.value.length);}}
}
let ruyeLoaded=false;
// 如页在 1180px 以下会变成上下结构；嵌在这里时宽度常在 900~1180 之间，强制保持左右结构
const RUYE_CSS=`@media (min-width:901px) and (max-width:1180px){
 .stage{grid-template-columns:minmax(360px,460px) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;grid-auto-rows:auto!important;overflow-y:hidden!important}
 .studio{height:auto!important;min-height:0!important;grid-column:1!important;grid-row:1!important}
 .stage .preview{overflow-y:auto!important;grid-column:2!important;grid-row:1!important;border-top:0!important;min-height:0!important}
 .stage .board-wrap{padding:22px 96px 26px 24px!important}
 .stage .board-wrap.no-meter{padding-right:24px!important}
 .panes{grid-template-columns:var(--outline-w) minmax(340px,1fr) minmax(340px,1fr)!important}
 .panes .preview{grid-column:auto!important;border-top:0!important}
}`;
const RUYE_SKIN="html[data-lvji],html[data-lvji] .app,html[data-lvji] .app[data-skin]{--desk:#eceef1;--paper:#fdfdfd;--soft:#e1e4e9;--rail:#e1e4e9;--ink:#16161d;--ink-deep:#16161d;--muted:#5b616d;--faint:#6b7079;--line:#cfd3da;--line-strong:#16161d;--brand:#16161d;--brand-strong:#000;--brand-soft:#ffe1ee;--brand-softer:#fff0f6;--canvas:#eceef1;--canvas-dot:rgba(22,22,29,.08);--card-shadow:6px 6px 0 #16161d;--shadow-pop:5px 5px 0 #16161d;--radius:10px;--radius-sm:8px;--ok:#16161d;--warn-dot:#ff2d87;--lv-acc:#ff2d87;--lv-hs:#16161d;--lv-spring:cubic-bezier(.3,1.7,.5,1);--glass:var(--paper);--glass-strong:var(--paper);--glass-line:var(--line)}\nhtml[data-lvji=dark],html[data-lvji=dark] .app,html[data-lvji=dark] .app[data-skin]{--desk:#17161b;--paper:#222027;--soft:#2c2a31;--rail:#2c2a31;--ink:#f2ede3;--ink-deep:#f2ede3;--muted:#a59f94;--faint:#8f8a82;--line:#3b3842;--line-strong:#f2ede3;--brand:#f2ede3;--brand-strong:#fff;--brand-soft:#40202f;--brand-softer:#2f1d26;--canvas:#17161b;--canvas-dot:rgba(242,237,227,.07);--card-shadow:6px 6px 0 #000;--shadow-pop:5px 5px 0 #000;--ok:#f2ede3;--lv-acc:#ff4f9c;--lv-hs:#000;--shell:#2c2a31;color-scheme:dark}\nhtml[data-lvji=dark] .app{background:var(--desk);color:var(--ink)}html[data-lvji=dark] .studio,html[data-lvji=dark] .module-pills{background:var(--paper)}html[data-lvji=dark] .module-pills button,html[data-lvji=dark] .library-btn,html[data-lvji=dark] .photo-actions button{background:var(--soft);color:var(--ink)}html[data-lvji=dark] .studio .field-block input,html[data-lvji=dark] .studio .field-block textarea,html[data-lvji=dark] .studio .tag-input,html[data-lvji=dark] .studio .date-trigger,html[data-lvji=dark] .skill-name,html[data-lvji=dark] select{background:#2c2a31;color:var(--ink)}html[data-lvji=dark] ::placeholder{color:#8f8a82}html[data-lvji=dark] .editor-head h2{background:none;-webkit-text-fill-color:var(--ink);color:var(--ink)}\nhtml[data-lvji] .aurora,html[data-lvji] .backdrop{display:none}\nhtml[data-lvji] .stage{background-image:radial-gradient(var(--canvas-dot) 1px,transparent 1.3px);background-size:7px 7px}\n/* 顶栏与标题：粗黑、略斜 */\nhtml[data-lvji] .topbar{background:var(--paper);border-bottom:2.5px solid var(--ink)}\nhtml[data-lvji] .brand-name{font-family:var(--font-ui);font-weight:900;font-style:normal;transform:skewX(-9deg);-webkit-text-stroke:.5px currentColor}\nhtml[data-lvji] .editor-head h2{font-family:var(--font-ui);font-weight:900;letter-spacing:.04em;transform:skewX(-7deg);transform-origin:left;-webkit-text-stroke:.5px currentColor;position:relative;z-index:0}\nhtml[data-lvji] .editor-head h2::after{content:'';position:absolute;left:-3px;right:-4px;bottom:2px;height:8px;background:var(--lv-acc);z-index:-1;transform:skewX(-14deg)}\nhtml[data-lvji] .doc-title{font-weight:800}\n/* 编辑面板：粗描边 + 硬阴影 */\nhtml[data-lvji] .studio{border:2.5px solid var(--ink);border-radius:12px;box-shadow:var(--card-shadow)}\nhtml[data-lvji] .module-pills{border-bottom:2.5px solid var(--ink);gap:7px}\nhtml[data-lvji] .module-pills button{border:2px solid var(--ink);border-radius:8px;color:var(--ink);font-weight:700;box-shadow:2px 2px 0 var(--lv-hs)}\nhtml[data-lvji] .module-pills button.on{background:var(--ink);color:var(--paper);box-shadow:2px 2px 0 var(--lv-acc);transform:skewX(-6deg)}\nhtml[data-lvji] .module-pills .manage{border-style:dashed;box-shadow:none}\nhtml[data-lvji] .studio .module-editor+.module-editor{border-top:2.5px dashed var(--ink)}\n/* 按钮：描边、硬阴影、按下回弹 */\nhtml[data-lvji] button:not(.meter-seg):not(.preview-rail){border-width:2px;border-color:var(--ink);border-radius:8px;font-weight:700;transition:transform .3s var(--lv-spring),box-shadow .3s var(--lv-spring),background .3s,color .3s}\nhtml[data-lvji] .topbar button,html[data-lvji] .studio .doc-editor button:not(.primary),html[data-lvji] .zoom button,html[data-lvji] .seg button,html[data-lvji] .menu-list button,html[data-lvji] .row-actions button,html[data-lvji] .toast-actions button{box-shadow:none}\nhtml[data-lvji] button:hover:not(:disabled):not(.meter-seg){transform:translate(-1px,-1px)}\nhtml[data-lvji] button:active:not(:disabled):not(.meter-seg){transform:translate(1px,1px) scale(.94);box-shadow:none}\nhtml[data-lvji] button.primary{background:var(--lv-acc);color:#16161d;border:2.5px solid var(--lv-hs);box-shadow:3px 3px 0 var(--lv-hs);font-style:italic;font-weight:800;letter-spacing:.02em}\nhtml[data-lvji] button.primary:hover:not(:disabled){background:var(--lv-acc);border-color:var(--lv-hs);box-shadow:4px 4px 0 var(--lv-hs)}\nhtml[data-lvji] .library-btn{background:var(--paper);border:2px solid var(--ink);color:var(--ink);box-shadow:2px 2px 0 var(--lv-hs)}\nhtml[data-lvji] .library-btn.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}\nhtml[data-lvji] .row-actions button,html[data-lvji] .menu-list button,html[data-lvji] .zoom button,html[data-lvji] .seg button,html[data-lvji] .toast-actions button{border-color:transparent}\n/* 输入框 */\nhtml[data-lvji] .field-block input,html[data-lvji] .field-block textarea,html[data-lvji] .skill-name,html[data-lvji] select{border:2px solid var(--ink);border-radius:8px}\nhtml[data-lvji] .field-block input:focus,html[data-lvji] .field-block textarea:focus,html[data-lvji] .skill-name:focus{border-color:var(--ink);box-shadow:3px 3px 0 var(--lv-acc)}\nhtml[data-lvji] .field-block>label{color:var(--ink);font-weight:700}\nhtml[data-lvji] .seg{background:var(--paper);box-shadow:none;border:2px solid var(--ink)}\nhtml[data-lvji] .seg button.on{background:var(--ink);color:var(--paper);box-shadow:none}\nhtml[data-lvji] .item-card{border-top:2px dashed var(--line)}\n/* 预览区外框（简历纸张内容不动） */\nhtml[data-lvji] .stage .preview-toolbar{background:var(--paper);border:2.5px solid var(--ink);border-radius:10px;box-shadow:4px 4px 0 var(--lv-hs);-webkit-backdrop-filter:none;backdrop-filter:none}\nhtml[data-lvji] .stage .zoom{border:2px solid var(--ink);border-radius:8px}\nhtml[data-lvji] .stage .board{box-shadow:0 0 0 2.5px var(--ink),8px 8px 0 2.5px var(--lv-hs)}\nhtml[data-lvji] .fit-pill{font-weight:700;color:var(--ink)}\nhtml[data-lvji] .fit-pill.ok i,html[data-lvji] .save-state i{background:var(--ink)}\nhtml[data-lvji] .fit-pill.warn i,html[data-lvji] .fit-pill.error i,html[data-lvji] .save-state.warn i,html[data-lvji] .save-state.pending i{background:var(--lv-acc)}\nhtml[data-lvji] .fit-pill.error{color:var(--ink);background:var(--brand-soft)}\n/* 右侧结构标尺：灰阶 + 一个强调色 */\nhtml[data-lvji] .meter-seg{border-radius:2px;box-shadow:0 0 0 1.5px var(--ink)}\nhtml[data-lvji] .meter-seg.c0{background:var(--lv-acc)}html[data-lvji] .meter-seg.c1{background:#16161d}html[data-lvji] .meter-seg.c2{background:#5f5a63}html[data-lvji] .meter-seg.c3{background:#878d98}html[data-lvji] .meter-seg.c4{background:#aeb4be}html[data-lvji] .meter-seg.c5{background:#cfd3da}\nhtml[data-lvji=dark] .meter-seg.c1{background:#f2ede3}\nhtml[data-lvji] .meter-seg.over{background:var(--lv-acc);outline:2px dashed var(--ink);outline-offset:2px}\nhtml[data-lvji] .meter-seg span{color:var(--ink);font-weight:800}\nhtml[data-lvji] .meter-seg:hover span{color:var(--ink);text-decoration:underline 3px var(--lv-acc)}\nhtml[data-lvji] .stage .preview-rail{background:var(--paper);border:2.5px solid var(--ink);box-shadow:4px 4px 0 var(--lv-hs)}\n/* 弹出层与提示 */\nhtml[data-lvji] .menu-list,html[data-lvji] .appearance-pop,html[data-lvji] .login-dialog{border:2.5px solid var(--ink);border-radius:10px;box-shadow:var(--shadow-pop)}\nhtml[data-lvji] .menu-list button:hover{background:var(--ink);color:var(--paper)}\nhtml[data-lvji] .toast{background:#16161d;color:#f2ede3;border:2.5px solid #16161d;border-radius:8px;box-shadow:4px 4px 0 var(--lv-acc);font-weight:700}\nhtml[data-lvji] ::selection{background:var(--lv-acc);color:#16161d}\nhtml[data-lvji] :focus-visible{outline:2.5px solid var(--lv-acc);outline-offset:2px}\n@media (prefers-reduced-motion:reduce){html[data-lvji] *{transition:none!important}}\nhtml[data-lvji=dark] .app .library-btn:not(.on),html[data-lvji=dark] .app .module-pills button:not(.on),html[data-lvji=dark] .app .photo-actions button,html[data-lvji=dark] .app .quick-picks button:not(.on),html[data-lvji=dark] .app .date-trigger{background:var(--soft)!important;color:var(--ink)}\nhtml[data-lvji=dark] .app .item-card{background:transparent!important}\nhtml[data-lvji=dark] .app .bullet-mark{background:var(--ink)}\n";
// 如页编辑器外壳套上履迹的打击感皮肤（简历纸张内容不动），并跟随深浅色
function ruyeSkin(f){try{const d=f&&f.contentDocument;if(!d||!d.documentElement)return;const H=d.documentElement;
 H.dataset.lvji=document.documentElement.dataset.theme==='dark'?'dark':'light';
 if(!d.getElementById('lvji-skin')){const st=d.createElement('style');st.id='lvji-skin';st.textContent=RUYE_SKIN;d.head.appendChild(st);}
 if(H.dataset.lvjiFx)return;H.dataset.lvjiFx='1';
 d.addEventListener('pointerup',e=>{if(!SKFX||SKFX.calm)return;const b=e.target.closest&&e.target.closest('button');if(!b||b.disabled)return;const R=f.getBoundingClientRect(),x=R.left+e.clientX,y=R.top+e.clientY;
  if(b.classList.contains('primary'))skHit(x,y,/PDF|导出|下载/.test(b.textContent)?'don':'pon');else SKFX.burst(x+scrollX,y+scrollY,{r:22,spikes:11,life:.3});},true);
}catch(e){console.warn(e);}}
function fixRuye(f){try{const d=f.contentDocument;if(!d)return;if(!d.getElementById('lvji-fix')){const st=d.createElement('style');st.id='lvji-fix';st.textContent=RUYE_CSS;d.head.appendChild(st);}ruyeSkin(f);}catch(e){console.warn(e);}}
async function showRuye(){
 const box=document.getElementById('ruyeBox');if(ruyeLoaded)return;
 try{const r=await fetch(RUYE+'api/health',{cache:'no-store'});if(!r.ok)throw 0;}catch{box.classList.add('err');return;}
 box.classList.remove('err');ruyeLoaded=true;await Promise.race([ruyeRestore,new Promise(r=>setTimeout(r,2500))]);const f=document.createElement('iframe');f.src=RUYE;f.title='如页简历编辑器';f.allow='clipboard-write';f.addEventListener('load',()=>fixRuye(f));box.appendChild(f);
}
function huntStart(){return db.settings.startDate||db.apps.map(a=>a.appliedAt).filter(Boolean).sort()[0]||today();}
function huntDays(){return Math.max(1,dayDiff(today(),huntStart())+1);}
function todayCard(){const td=today(),tm=dstr(new Date(Date.now()+864e5)),now=nowLocal(),I=[];
 for(const {a,e} of allEvents()){if(!e.at)continue;const d=e.at.slice(0,10);
  if(d===td)I.push({ic:e.type==='interview'?'🎤':e.type==='test'?'📝':'📌',t:`${e.at.slice(11,16)} ${esc(a.company)} · ${esc(e.title||EV[e.type])}`,done:e.done||(e.type!=='interview'&&e.type!=='test'&&e.at<now),open:a.id,btn:(e.type==='interview'||e.type==='test')&&!e.done?`<button class="btn sm" data-act="prep" data-a="${a.id}" data-e="${e.id}">🎯 备战</button>`:'',k:0});
  else if(d===tm&&!e.done&&(e.type==='interview'||e.type==='test'))I.push({ic:'🌙',t:`明天 ${e.at.slice(11,16)} ${esc(a.company)} ${esc(e.title||EV[e.type])}，今晚过一遍备战卡`,done:!!(e.prep&&Object.values(e.prep).filter(Boolean).length>=4),btn:`<button class="btn sm" data-act="prep" data-a="${a.id}" data-e="${e.id}">🎯 备战</button>`,k:1});}
 for(const a of db.apps)if(a.status==='wish'&&a.due&&a.due>=td&&a.due<=tm)I.push({ic:'⏳',t:`${esc(a.company)} · ${esc(a.role)} ${a.due===td?'今天':'明天'}截止投递`,open:a.id,k:2});
 const goal=+db.settings.weekGoal||0;if(goal){const ws=weekStart(),sent=db.apps.filter(a=>a.status!=='wish'&&a.appliedAt&&new Date(a.appliedAt+'T00:00')>=ws),left=goal-sent.length,days=7-dayDiff(td,dstr(ws)),tn=db.apps.filter(a=>a.status!=='wish'&&a.appliedAt===td).length;
  if(left>0||tn){const need=Math.max(0,Math.ceil(Math.max(0,left+tn)/Math.max(1,days)));if(need||tn)I.push({ic:'📮',t:tn>=need?`今天已投 ${tn} 个，达标了${left>0?`（本周还差 ${left} 个）`:'，本周目标也完成了'}`:`今天目标投 ${need} 个，已投 ${tn} 个（本周还差 ${left} 个）`,done:tn>=need,btn:tn<need?`<button class="btn sm" data-act="add">＋ 记一个</button>`:'',k:3});}}
 const Q=allQuestions().filter(x=>!x.dup&&db.qmark[x.h]!=='ok'&&(!db.qsrs[x.h]||db.qsrs[x.h].due<=td)).length;
 if(Q)I.push({ic:'🎴',t:`${Q} 道面试题到期该复习了`,btn:`<button class="btn sm" data-act="review">开始</button>`,k:4});
 if(db.settings.lcUser&&db.lc){const T=lcToday(),L=db.lc;I.push({ic:'🧩',t:T.ac.length?`今天力扣已通过 ${T.ac.length} 题${T.dailyDone?'，每日一题也做了':''}`:`今天还没刷力扣${L.daily?` · 每日一题「${esc(L.daily.title)}」${LC_DN[L.daily.difficulty]||''}`:''}`,done:T.ac.length>0,btn:T.ac.length||!L.daily?'':ext(lcLink(L.daily.slug),'去做 ↗'),k:4});}
 const dp=duePeople().length;if(dp)I.push({ic:'🤝',t:`${dp} 位联系人该跟进了`,view:'people',k:5});
 I.push({ic:'📓',t:'写一句今天的日记，记下努力的自己',done:jActive(td),view:'journal',k:6});
 const n=I.filter(x=>x.done).length;
 return `<div class="card sec today"><h3>☀️ 今天该做什么<span class="m">${n}/${I.length} 完成</span></h3><div class="tbar"><i style="width:${I.length?n/I.length*100:0}%"></i></div>
 ${I.sort((x,y)=>(x.done-y.done)||(x.k-y.k)).map(x=>`<div class="ti ${x.done?'done':''}" ${x.open?`data-open="${x.open}"`:x.view?`data-view="${x.view}"`:''}><span class="tic">${x.done?'✓':x.ic}</span><span class="tt">${x.t}</span>${x.btn||''}</div>`).join('')}</div>`;}
function duePeople(){return db.people.filter(p=>p.nextAt&&p.nextAt<=today());}
function meCard(){const P=db.settings.profile||{},st=streak();
 return `<div class="card me"><img src="avatar.png" alt="" onerror="this.remove()"><div style="flex:1;min-width:0"><div class="t1" style="font-size:16px">${esc(P.name||'我')} · 求职第 ${huntDays()} 天${st?` · 🔥 连续记录 ${st} 天`:''}</div>
 <div class="t2">${P.target?'目标：'+esc(P.target):'还没写下目标，点右边「编辑」写一个吧'}${P.cities?' · '+esc(P.cities):''}${P.salary?' · 期望 '+esc(P.salary):''}</div>${P.motto?`<div style="margin-top:4px;font-style:italic">“${esc(P.motto)}”</div>`:''}</div>
 ${jActive(today())?'<span class="tag" style="color:var(--ok)">✓ 今天已记录</span>':'<button class="btn sm primary" data-view="journal">✎ 写今天的日记</button>'}<button class="btn sm" data-act="chat">💬 问 AI 教练</button><button class="btn sm" data-act="editme">编辑</button></div>`;}
function greet(){const h=new Date().getHours(),d=new Date();return `${h<11?'早上好':h<14?'中午好':h<18?'下午好':'晚上好'}，今天是 ${d.getMonth()+1} 月 ${d.getDate()} 日 星期${WK[d.getDay()]}`;}
function vEmpty(){return `<div class="card hero" style="padding:36px 30px;margin-bottom:16px"><div style="font-size:44px">🗂️</div><h2>开始记录你的求职之路</h2><p>投递、笔试、面试、复盘、Offer，全部放在一个地方。数据只保存在你自己的电脑上。</p>
 <button class="btn primary" data-act="add">＋ 新增第一条投递</button>&nbsp;&nbsp;<button class="btn" data-act="bulk">📋 批量粘贴</button>&nbsp;&nbsp;<button class="btn" data-act="web">🌐 浏览器一键添加</button>&nbsp;&nbsp;<button class="btn" data-act="sample">看看示例数据</button>
 <p class="t2" style="margin:16px 0 0">小技巧：在这里直接按 Ctrl+V 粘贴一个岗位链接或一堆文字，会自动帮你新建。</p></div>`;}
function stTag(k){const s=SM[k]||SM.applied;return `<span class="tag" style="background:${s.c}1a;color:${s.c}"><span class="d" style="background:${s.c}"></span>${s.n}</span>`;}
function whenBox(at){const d=new Date(at),ds=dstr(d),dd=dayDiff(ds,today());return `<div class="when ${dd===0?'today':''}"><span>${dd===0?'今天':dd===1?'明天':(d.getMonth()+1)+'月'}</span><b>${dd<=1&&dd>=0?pad(d.getHours())+':'+pad(d.getMinutes()):d.getDate()}</b></div>`;}
function weekStart(){const m=new Date();m.setHours(0,0,0,0);m.setDate(m.getDate()-((m.getDay()+6)%7));return m;}

function vDash(){
 const A=db.apps,sent=A.filter(a=>a.status!=='wish');
 const responded=sent.filter(a=>!['applied','wish'].includes(a.status)||a.events.some(e=>e.type!=='note'&&e.type!=='followup'));
 const interviewed=sent.filter(a=>['interview','hr','offer'].includes(a.status)||a.events.some(e=>e.type==='interview'));
 const offers=A.filter(a=>a.status==='offer');
 const active=A.filter(a=>ACTIVE.includes(a.status)).length;
 const ivCount=allEvents().filter(({e})=>e.type==='interview').length;
 const rate=sent.length?Math.round(responded.length/sent.length*100):0;
 const now=nowLocal(),lim=dstr(new Date(Date.now()+14*864e5));
 const up=allEvents().filter(({e})=>!e.done&&e.at&&e.at>=now.slice(0,10)&&e.at.slice(0,10)<=lim).sort((x,y)=>x.e.at.localeCompare(y.e.at)).slice(0,7);
 const review=allEvents().filter(({e})=>e.type==='interview'&&e.at&&e.at<now&&!e.review&&!e.questions);
 const RS=replyStats(),IVS=ivStale();
 const stale=A.filter(a=>a.status==='applied'&&a.appliedAt&&dayDiff(today(),a.appliedAt)>=waitFor(a.channel,RS).d&&!(a.snooze&&a.snooze>today())&&!a.events.some(e=>e.at&&e.at.slice(0,10)>=a.appliedAt));
 const AGA=agentAlerts(AG.d,Date.now());
 const dueSoon=A.filter(a=>a.status==='wish'&&a.due&&dayDiff(a.due,today())>=0&&dayDiff(a.due,today())<=3).sort((x,y)=>x.due.localeCompare(y.due));
 const dl=A.filter(a=>a.status==='offer'&&a.offer?.deadline&&dayDiff(a.offer.deadline,today())<=3&&dayDiff(a.offer.deadline,today())>=0);
 const ws=weekStart(),weekN=sent.filter(a=>a.appliedAt&&new Date(a.appliedAt+'T00:00')>=ws).length,goal=+db.settings.weekGoal||0;
 const weeks=[];for(let i=7;i>=0;i--){const s=new Date(ws-i*7*864e5),e=new Date(+s+7*864e5);weeks.push({l:`${s.getMonth()+1}/${s.getDate()}`,n:sent.filter(a=>{const d=new Date(a.appliedAt+'T00:00');return d>=s&&d<e;}).length});}
 const wmax=Math.max(1,...weeks.map(w=>w.n));
 const fun=[['投递',sent.length,'#5f5a63'],['有回应',responded.length,'#959ba6'],['进入面试',interviewed.length,'#5f5a63'],['拿到 Offer',offers.length,'#4b4852']];
 const chs=CH.map(c=>{const L=sent.filter(a=>a.channel===c);return{c,n:L.length,r:L.filter(a=>responded.includes(a)).length};}).filter(x=>x.n).sort((a,b)=>b.n-a.n);
 const cmax=Math.max(1,...chs.map(x=>x.n));
 const hasSample=A.some(a=>a.sample);
 return `${meCard()}${A.length?todayCard():vEmpty()}${lcCard()}
 ${hasSample?`<div class="alert info">ℹ️ 当前包含示例数据，熟悉后可以<a href="#" data-act="clearsample" style="margin-left:4px">一键清除示例</a></div>`:''}
 ${dl.map(a=>`<div class="alert" data-open="${a.id}">⏰ <b>${esc(a.company)}</b> 的 Offer 将在 ${dayDiff(a.offer.deadline,today())===0?'今天':dayDiff(a.offer.deadline,today())+' 天后'}截止答复</div>`).join('')}
 ${goal?`<div class="card goal"><div><div class="t1">本周投递目标</div><div class="t2">${weekN>=goal?'🎉 已完成，继续保持':'还差 '+(goal-weekN)+' 个'}</div></div><div class="bar"><i style="width:${Math.min(100,weekN/goal*100)}%"></i></div><div class="big">${weekN}<span class="t2"> / ${goal}</span></div><button class="btn sm ghost" data-view="settings">调整</button></div>`:''}
 <div class="grid kpis">
  <div class="card kpi"><div class="l">累计投递</div><div class="v">${sent.length}</div><div class="h">待投递 ${A.length-sent.length} 个</div></div>
  <div class="card kpi"><div class="l">进行中</div><div class="v">${active}</div><div class="h">笔试 / 面试流程中</div></div>
  <div class="card kpi"><div class="l">面试场次</div><div class="v">${ivCount}</div><div class="h">已记录的面试</div></div>
  <div class="card kpi"><div class="l">回复率</div><div class="v">${rate}<span style="font-size:16px">%</span></div><div class="h">${responded.length}/${sent.length} 有回应</div></div>
  <div class="card kpi"><div class="l">Offer</div><div class="v" style="color:var(--ok)">${offers.length}</div><div class="h">${offers.length?'最高年包 '+fmtK(Math.max(...offers.map(a=>annual(a.offer)))):'继续加油'}</div></div>
 </div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>📅 接下来两周<span class="m"><a href="#" data-view="cal">全部日程 →</a></span></h3>
   ${up.length?up.map(({a,e})=>`<div class="ev-row" data-open="${a.id}">${whenBox(e.at)}<div style="flex:1;min-width:0"><div class="t1">${esc(a.company)} · ${esc(e.title||EV[e.type])} ${clashTag(e,a)}</div><div class="t2">${esc(a.role)} · ${EV[e.type]} · ${+e.at.slice(5,7)}月${+e.at.slice(8,10)}日 ${e.at.slice(11,16)}${e.place?' · '+esc(e.place):''}</div></div>${(e.type==='interview'||e.type==='test')?`<button class="btn sm" data-act="prep" data-a="${a.id}" data-e="${e.id}" title="面试备战卡">🎯 准备</button>`:''}${/^https?:/.test(e.place||'')?ext(safeUrl(e.place),'进入会议','btn sm'):stTag(a.status)}</div>`).join(''):'<div class="empty">没有即将到来的笔试或面试。在投递详情里可以添加日程。</div>'}
  </div>
  <div class="card sec"><h3>✅ 待办提醒</h3>
   ${dueSoon.map(a=>`<div class="alert" data-open="${a.id}">⏳ <b>${esc(a.company)}</b> · ${esc(a.role)} ${dayDiff(a.due,today())===0?'今天':dayDiff(a.due,today())+' 天后'}截止投递，还没投</div>`).join('')}
   ${review.map(({a,e})=>`<div class="alert" data-open="${a.id}">📝 ${esc(a.company)} 的「${esc(e.title||'面试')}」还没写复盘，趁记忆清楚补一下<span style="flex:1"></span><button class="btn sm" data-act="rvopen" data-a="${a.id}" data-e="${e.id}">📝 3 步复盘</button></div>`).join('')}
   ${stale.map(a=>`<div class="alert" data-open="${a.id}">📨 ${esc(a.company)} · ${esc(a.role)} 投递 ${dayDiff(today(),a.appliedAt)} 天无回音${(w=>w.x?`<span class="t2">（${w.own?esc(a.channel):'你的投递'}通常 ${w.x.med} 天内有回音，大概率没戏了）</span>`:'')(waitFor(a.channel,RS))}<span style="flex:1"></span>${db.tpls.find(t=>t.id==='t3')?`<button class="btn sm" data-act="followcopy" data-a="${a.id}">📋 复制跟进话术</button>`:''}<button class="btn sm ghost" data-act="snooze" data-a="${a.id}" title="7 天后再提醒">再等等</button><button class="btn sm ghost" data-act="ghosted" data-a="${a.id}" title="移到「未通过」">没戏了</button></div>`).join('')}
   ${IVS.L.map(({a,e,days})=>`<div class="alert" data-open="${a.id}">⏳ ${esc(a.company)} ${esc(e.title||EV[e.type])}后 ${days} 天没消息<span class="t2">（${IVS.S?`你的面试一般 ${IVS.S.med} 天内就有下文`:'一般一周内会有下文'}，可以问一下进度）</span><span style="flex:1"></span><button class="btn sm" data-act="ivmsg" data-a="${a.id}">✨ AI 问进度</button><button class="btn sm ghost" data-act="snooze" data-a="${a.id}" title="7 天后再提醒">再等等</button><button class="btn sm ghost" data-act="ivdead" data-a="${a.id}" title="移到「未通过」">没戏了</button></div>`).join('')}
   ${duePeople().map(p=>`<div class="alert" data-view="people">🤝 该联系 <b>${esc(p.name)}</b>${p.company?'（'+esc(p.company)+'）':''} 了${p.notes?' · '+esc(p.notes.slice(0,30)):''}</div>`).join('')}
   ${AGA.map(a=>`<div class="alert ${a.lv==='bad'?'bad':''}">🤖 ${esc(a.msg)}<span style="flex:1"></span><button class="btn sm" data-view="agent">查看</button><button class="btn sm ghost" data-act="agsnooze" data-k="${esc(a.k)}" title="7 天内不再提醒这一条">知道了</button></div>`).join('')}
   ${!AGA.length&&!dueSoon.length&&!review.length&&!stale.length&&!duePeople().length?'<div class="empty">暂时没有需要处理的事项 🎉</div>':''}
  </div>
 </div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>求职漏斗</h3><div class="funnel">
   ${fun.map(([l,n,c],i)=>`<div class="row"><span>${l}</span><div class="bar"><i style="width:${sent.length?Math.max(n?4:0,n/sent.length*100):0}%;background:${c}"></i></div><div class="n">${n}${i?`<small>${fun[i-1][1]?Math.round(n/fun[i-1][1]*100):0}%</small>`:''}</div></div>`).join('')}
  </div></div>
  <div class="card sec"><h3>每周投递<span class="m">近 8 周</span></h3><div class="weeks">${weeks.map((w,i)=>`<div style="--i:${i}"><b>${w.n||''}</b><i style="height:${w.n/wmax*90}%;animation-delay:${i*60}ms"></i><span>${w.l}</span></div>`).join('')}</div></div>
 </div>
 <div class="card sec" style="margin-top:16px"><h3>渠道效果<span class="m">投递数 · 回复率 · 一般几天回</span></h3>
  ${chs.length?chs.map(x=>`<div class="chl w"><span>${x.c}</span><div class="bar"><i style="width:${x.n/cmax*100}%"></i></div><span class="r">${x.n} 个 · ${Math.round(x.r/x.n*100)}%${RS[x.c]?` · 约 ${RS[x.c].med} 天`:''}</span></div>`).join(''):'<div class="empty">还没有已投递的记录</div>'}
 </div>`;
}
function dueTag(a){if(!a.due||a.status!=='wish')return '';const d=dayDiff(a.due,today());return `<span class="tag" style="${d<=3?'background:#ff2d8718;color:var(--bad);font-weight:600':''}">⏳ ${d<0?'已截止':d===0?'今天截止':a.due.slice(5).replace('-','/')+' 截止'}</span>`;}
function kcard(a){
 const ne=nextEvent(a),p=PRI[a.priority]||PRI[2],link=safeUrl(a.link)||safeUrl(a.site);
 return `<div class="kc" draggable="true" data-id="${a.id}" data-open="${a.id}" style="--n:${_n++}"><div class="co"><span class="dot" style="background:${p[1]}" title="优先级${p[0]}"></span>${esc(a.company)||'未命名公司'}${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" title="打开${safeUrl(a.link)?'岗位链接':'公司官网'}">↗</a>`:''}</div><div class="ro">${esc(a.role)||'—'}</div>
 <div class="meta">${a.city?`<span class="tag">📍${esc(a.city)}</span>`:''}${a.salary?`<span class="tag">💰${esc(a.salary)}</span>`:''}${ne?`<span class="tag" style="background:var(--accent-soft);color:var(--accent)">⏰ ${ne.at.slice(5,10).replace('-','/')} ${ne.at.slice(11,16)} ${EV[ne.type]}</span>`:''}${dueTag(a)}${a.status==='offer'&&annual(a.offer)?`<span class="tag" style="color:var(--ok)">年包 ${fmtK(annual(a.offer))}</span>`:''}</div></div>`;
}
let _n=0;
let FOLD=(()=>{try{return JSON.parse(localStorage.getItem('jt_fold'))||{rejected:1,dropped:1};}catch{return {rejected:1,dropped:1};}})();
function vBoard(){_n=0;return `<div class="board">${ST.map(s=>{const L=db.apps.filter(a=>a.status===s.k).sort((a,b)=>(a.priority-b.priority)||(b.updatedAt-a.updatedAt));
 // 收起的列、以及空着的列（待投递除外）都显示成窄条，省出地方给有卡片的列；窄条照样可以把卡片拖进去
 if(FOLD[s.k])return `<div class="col fold" data-col="${s.k}" data-act="fold" data-k="${s.k}" title="点开查看${s.n}（也可以把卡片拖到这里）"><span class="dot" style="background:${s.c}"></span><b>${s.n}</b><span class="c">${L.length}</span></div>`;
 if(!L.length&&s.k!=='wish')return `<div class="col fold empty" data-col="${s.k}" title="${s.n}：暂时没有，可以把卡片拖到这里"><span class="dot" style="background:${s.c}"></span><b>${s.n}</b><span class="c">0</span></div>`;
 return `<div class="col" data-col="${s.k}"><h4><span class="dot" style="background:${s.c}"></span>${s.n}<span class="c">${L.length}</span><button class="foldbtn" data-act="fold" data-k="${s.k}" title="收起这一列">⟨</button></h4>${L.map(kcard).join('')}${s.k==='wish'?'<button class="btn sm ghost" data-act="add" data-st="wish" style="width:100%;justify-content:center">＋ 添加</button>':''}</div>`;}).join('')}</div>`;}
let LIST_LIM=200; // 记录很多时先显示 200 条，点「显示更多」再加载，页面不卡
function vList(){
 let L=db.apps.filter(a=>(!F.status||a.status===F.status)&&(!F.channel||a.channel===F.channel)&&(!F.q||[a.company,a.role,a.city,a.notes,a.resume].join(' ').toLowerCase().includes(F.q.toLowerCase())));
 const so={updated:(a,b)=>b.updatedAt-a.updatedAt,applied:(a,b)=>(b.appliedAt||'').localeCompare(a.appliedAt||''),company:(a,b)=>a.company.localeCompare(b.company,'zh'),priority:(a,b)=>a.priority-b.priority,status:(a,b)=>ST.findIndex(s=>s.k===a.status)-ST.findIndex(s=>s.k===b.status)};
 L.sort(so[F.sort]);_n=0;
 return `<div class="tools"><input class="inp" id="q" placeholder="🔍 搜索公司、岗位、城市、备注、简历" value="${esc(F.q)}" style="width:300px">
 <select class="inp" data-flt="status"><option value="">全部状态</option>${ST.map(s=>`<option value="${s.k}" ${F.status===s.k?'selected':''}>${s.n}</option>`).join('')}</select>
 <select class="inp" data-flt="channel"><option value="">全部渠道</option>${CH.map(c=>`<option ${F.channel===c?'selected':''}>${c}</option>`).join('')}</select>
 <select class="inp" data-flt="sort">${[['updated','最近更新'],['applied','投递日期'],['priority','优先级'],['status','进度'],['company','公司名']].map(([k,n])=>`<option value="${k}" ${F.sort===k?'selected':''}>按${n}排序</option>`).join('')}</select>
 <span style="color:var(--muted);font-size:13px">${L.length} 条</span><span style="flex:1"></span><button class="btn sm" data-act="hunt" title="联网搜索合适的岗位，一键加进待投递">🧭 AI 找岗位</button><button class="btn sm" data-act="csv" title="导出全部投递，可用 Excel 打开">📊 导出 Excel</button></div>
 <div class="card" style="overflow:hidden"><table><thead><tr><th>公司 / 岗位</th><th>进度</th><th>城市</th><th>薪资</th><th>渠道</th><th>投递日期</th><th>下一步</th><th>链接</th></tr></thead><tbody>
 ${L.slice(0,LIST_LIM).map(a=>{const ne=nextEvent(a),p=PRI[a.priority]||PRI[2];return `<tr data-open="${a.id}" style="--n:${_n++}"><td><div class="t1" style="display:flex;align-items:center;gap:7px"><span class="dot" style="background:${p[1]}"></span>${esc(a.company)}</div><div class="t2">${esc(a.role)}</div></td><td>${stTag(a.status)}</td><td>${esc(a.city)}</td><td>${esc(a.salary)}</td><td>${esc(a.channel)}</td><td>${a.appliedAt||''}</td><td>${ne?`<span class="t2">${ne.at.slice(5,16).replace('T',' ')} ${EV[ne.type]}</span>`:'<span class="t2">—</span>'}</td><td style="white-space:nowrap">${ext(safeUrl(a.link),'岗位','tag')} ${ext(safeUrl(a.site),'官网','tag')}${!safeUrl(a.link)&&!safeUrl(a.site)?'<span class="t2">—</span>':''}</td></tr>`;}).join('')||`<tr><td colspan="8"><div class="empty">${db.apps.length?'没有匹配的记录':'还没有投递记录，点右上角「＋ 新增投递」添加第一条'}</div></td></tr>`}
 </tbody></table>${L.length>LIST_LIM?`<div style="padding:12px;text-align:center"><button class="btn" data-act="listmore">显示更多（还有 ${L.length-LIST_LIM} 条）</button></div>`:''}</div>`;
}
function vCal(){
 const E=allEvents().filter(({e})=>e.at).sort((x,y)=>x.e.at.localeCompare(y.e.at));
 const head=`<div class="tools"><div class="seg"><button data-cal="list" class="${calMode==='list'?'on':''}">列表</button><button data-cal="month" class="${calMode==='month'?'on':''}">月历</button></div>
  ${calMode==='month'?`<button class="btn sm" data-mon="-1">‹</button><b>${calMonth.getFullYear()} 年 ${calMonth.getMonth()+1} 月</b><button class="btn sm" data-mon="1">›</button><button class="btn sm ghost" data-mon="0">回到本月</button>`:''}
  <span style="flex:1"></span><button class="btn sm" data-act="invite">📋 粘贴面试邀请</button><button class="btn sm" data-act="icsall" title="生成 .ics 文件，可导入手机或电脑日历">📅 导出未来日程到日历</button></div>`;
 if(calMode==='month'){
  const y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));
  let cells='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=dstr(d),L=E.filter(({e})=>e.at.slice(0,10)===ds);
   if(i===35&&d.getMonth()!==m)break;
   cells+=`<div style="--n:${i}" class="d ${d.getMonth()!==m?'o':''} ${ds===today()?'t':''}"><div class="n">${d.getDate()}</div>${L.map(({a,e})=>{const c=e.done?'#7c8494':e.type==='interview'?'#5f5a63':e.type==='test'?'#959ba6':'#787e8a';return `<span class="e" data-open="${a.id}" style="background:${c}1f;color:${c}" title="${esc(a.company)} ${esc(e.title||EV[e.type])}">${clashes(e,a).length?'⚠ ':''}${e.at.slice(11,16)} ${esc(a.company)}</span>`;}).join('')}</div>`;}
  return head+`<div class="month">${'一二三四五六日'.split('').map(w=>`<div class="h">周${w}</div>`).join('')}${cells}</div>`;
 }
 const t=today(),groups={};
 const label=d=>{const dd=dayDiff(d,t);if(dd===0)return'今天';if(dd===1)return'明天';const D=new Date(d+'T00:00');return `${D.getMonth()+1} 月 ${D.getDate()} 日 · 星期${WK[D.getDay()]}`;};
 const past=E.filter(({e})=>e.at.slice(0,10)<t).reverse(),fut=E.filter(({e})=>e.at.slice(0,10)>=t);
 for(const x of fut){const l=label(x.e.at.slice(0,10));(groups[l]=groups[l]||[]).push(x);}
 const row=({a,e},showDate)=>`<div class="card sch ${e.done?'done':''}" data-open="${a.id}"><input type="checkbox" class="chk" data-done="${a.id}|${e.id}" ${e.done?'checked':''} title="标记完成"><div class="tm">${showDate?`<span class="t2">${e.at.slice(5,10).replace('-','/')}</span> `:''}${e.at.slice(11,16)}</div><div style="flex:1;min-width:0"><div class="t1">${esc(a.company)} · ${esc(e.title||EV[e.type])} ${clashTag(e,a)}</div><div class="t2">${esc(a.role)}${e.place?' · '+esc(e.place):''}</div></div>${/^https?:/.test(e.place||'')&&!e.done?ext(safeUrl(e.place),'进入会议'):''}<span class="tag">${EV[e.type]}</span>${e.rating?`<span class="t2">${'★'.repeat(e.rating)}</span>`:''}</div>`;
 return head+`${Object.keys(groups).length?Object.entries(groups).map(([l,L])=>`<div class="daygrp"><h5>${l}</h5>${L.map(x=>row(x)).join('')}</div>`).join(''):'<div class="card empty" style="margin-bottom:18px">接下来没有安排。打开某个投递，在「面试与进展」里添加即可。</div>'}
 ${past.length?`<div class="daygrp"><h5>已过去</h5>${past.slice(0,40).map(x=>row(x,true)).join('')}</div>`:''}`;
}
function vOffer(){
 const L=db.apps.filter(a=>a.status==='offer'||annual(a.offer)).map(a=>({a,v:annual(a.offer)})).sort((x,y)=>y.v-x.v);
 if(!L.length)return `<div class="card hero"><div style="font-size:40px">🏆</div><h2>还没有 Offer</h2><p>当某个投递进入 Offer 阶段，在详情里填写薪资构成，这里会自动算年包并对比。</p></div>`;
 const best=L[0].v;
 const score=n=>`<span class="score">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
 const total=x=>Math.round((best?x.v/best:0)*60+(+x.a.offer.growth||3)*4+(+x.a.offer.wlb||3)*4);
 return `<div class="card" style="overflow:hidden"><table><thead><tr><th>公司 / 岗位</th><th>城市</th><th>月薪 × 月数</th><th>奖金/股票/其他</th><th>年包</th><th>成长</th><th>工作生活平衡</th><th>综合分</th><th>答复截止</th></tr></thead><tbody>
 ${L.map(x=>{const o=x.a.offer,dl=o.deadline?dayDiff(o.deadline,today()):null;return `<tr data-open="${x.a.id}" class="${x.v===best&&best?'best':''}"><td><div class="t1">${esc(x.a.company)}${x.v===best&&best?' <span class="pill" style="background:#4b485222;color:var(--ok)">最高</span>':''}</div><div class="t2">${esc(x.a.role)}</div></td><td>${esc(x.a.city)}</td><td>${o.base?(+o.base).toLocaleString()+' × '+(o.months||12):'—'}</td><td class="t2">${[o.bonus&&'奖 '+fmtK(+o.bonus),o.stock&&'股 '+fmtK(+o.stock),o.other&&'其他 '+fmtK(+o.other)].filter(Boolean).join(' · ')||'—'}</td><td class="big">${x.v?fmtK(x.v):'—'}</td><td>${score(+o.growth||0)}</td><td>${score(+o.wlb||0)}</td><td><b>${total(x)}</b></td><td>${o.deadline?`<span style="color:${dl<=3?'var(--bad)':'inherit'}">${o.deadline}${dl>=0?` (${dl===0?'今天':dl+'天'})`:' 已过'}</span>`:'—'}</td></tr>`;}).join('')}
 </tbody></table></div><p class="t2" style="margin-top:12px">年包 = 月薪 × 月数 + 年终奖 + 年化股票 + 其他补贴。综合分 = 年包占 60 分、成长 20 分、平衡 20 分，只作参考，最终还是看你自己最在意什么。</p>`;
}
function allQuestions(){const Q=[],seen=new Set();for(const {a,e} of allEvents())if(e.questions)for(const line of e.questions.split(/\n+/)){const raw=line.replace(/^\s*(\d+[.、)]|[-*•])\s*/,'').trim();if(!raw)continue;const url=(raw.match(/https?:\/\/\S+/)||[])[0]||'';const q=raw.replace(/https?:\/\/\S+/,'').trim()||raw;const h=hashStr(q);Q.push({q,url,h,a,e,dup:seen.has(h)});seen.add(h);}
 for(const m of db.mocks||[])if(!m.aid)for(const q of m.badQ||[]){const h=hashStr(q);Q.push({q,url:'',h,a:MOCK_A,e:{title:'AI 模拟面试',type:'note',rating:Math.max(1,Math.round((+m.report?.score||0)/20))},dup:seen.has(h)});seen.add(h);}return Q;}
function linkify(s){return esc(s);}
const TOPICS=[
 ['算法与数据结构',/算法|两数|子串|子序列|岛屿|排序|链表|二叉树|树的|动态规划|\bdp\b|leetcode|力扣|数组|回溯|贪心|二分|堆排|栈|队列|哈希表|图的|最短路|手写|lru/i],
 ['JVM',/jvm|\bgc\b|垃圾回收|类加载|内存模型|双亲委派|oom|内存泄漏|堆内存|元空间/i],
 ['并发编程',/线程|并发|锁|synchronized|volatile|\bcas\b|aqs|juc|threadlocal|原子类|死锁/i],
 ['Java 基础',/java|集合|hashmap|arraylist|concurrenthashmap|泛型|反射|异常|string|接口|抽象类|面向对象|多态/i],
 ['Spring / 框架',/spring|\bioc\b|\baop\b|bean|mybatis|注解|事务传播|springboot|django|flask|gin/i],
 ['MySQL / 数据库',/mysql|索引|事务|隔离级别|mvcc|b\+树|\bsql\b|慢查询|分库分表|主从|binlog|redo|undo|数据库/i],
 ['Redis / 缓存',/redis|缓存|穿透|击穿|雪崩|持久化|\brdb\b|\baof\b|跳表|布隆/i],
 ['消息队列',/kafka|rocketmq|rabbitmq|消息队列|\bmq\b|消息丢失|重复消费/i],
 ['计算机网络',/tcp|udp|http|https|握手|挥手|\bdns\b|网络|cookie|session|websocket|拥塞/i],
 ['操作系统',/进程|内存管理|虚拟内存|操作系统|io ?多路|epoll|select|零拷贝|页表|调度|linux/i],
 ['分布式 / 系统设计',/分布式|微服务|设计一个|系统设计|高并发|高可用|限流|熔断|一致性|\bcap\b|raft|幂等|秒杀|负载均衡/i],
 ['大数据',/spark|flink|hadoop|hive|hbase|数仓|数据仓库|宽依赖|shuffle|mapreduce/i],
 ['Go 语言',/go|golang|goroutine|channel|gmp|defer|切片/i],
 ['AI / 大模型',/大模型|llm|\brag\b|agent|prompt|transformer|微调|向量/i],
 ['项目与行为',/项目|介绍一下|难点|为什么|职业规划|团队|优缺点|挑战|收获|实习/i]];
function topicOf(q){for(const [n,re] of TOPICS)if(re.test(q))return n;return '其他';}
let qTopic='';
function weakHtml(Q){if(Q.length<3)return '';const mk=h=>db.qmark[h]||'';const M={};
 for(const x of Q){const t=topicOf(x.q),m=M[t]=M[t]||{t,n:0,ok:0,re:0,bad:0};m.n++;if(mk(x.h)==='ok')m.ok++;if(mk(x.h)==='re')m.re++;if(x.e.rating&&x.e.rating<=2)m.bad++;}
 const L=Object.values(M).map(m=>({...m,w:(m.n-m.ok)+m.re+m.bad*.5})).sort((a,b)=>b.w-a.w||b.n-a.n),top=L.filter(m=>m.n>m.ok&&m.t!=='其他').slice(0,2);
 return `<div class="card sec weak"><h3>📊 知识点分布<span class="m">按被问次数和掌握情况统计 · 点一行只看这一类</span></h3>
 ${top.length?`<div class="alert info" style="margin-bottom:10px">最该补的：${top.map(m=>`<b>${esc(m.t)}</b>（${m.n-m.ok} 道没掌握${m.bad?`，${m.bad} 道出自答得不好的面试`:''}）`).join('、')}</div>`:'<div class="alert info" style="margin-bottom:10px">🎉 所有类别都掌握了</div>'}
 ${L.map(m=>`<div class="wk ${qTopic===m.t?'on':''}" data-qt="${esc(m.t)}"><span class="wn">${esc(m.t)}</span><div class="wb"><i class="ok" style="width:${m.ok/m.n*100}%"></i><i class="re" style="width:${m.re/m.n*100}%"></i></div><span class="t2 wc">${m.ok}/${m.n} 已掌握${m.re?` · ${m.re} 待复习`:''}${m.bad?` · <span style="color:var(--bad)">${m.bad} 答得差</span>`:''}</span></div>`).join('')}</div>`;}
function vBank(){
 const Q=allQuestions().filter(x=>!x.dup),k=qSearch.toLowerCase();
 const mk=h=>db.qmark[h]||'';
 const L=Q.filter(x=>(!qTopic||topicOf(x.q)===qTopic)&&(!k||(x.q+x.a.company+(x.e.title||'')).toLowerCase().includes(k))&&(qFilter==='all'||(qFilter==='todo'&&mk(x.h)!=='ok')||(qFilter==='ok'&&mk(x.h)==='ok')||(qFilter==='re'&&mk(x.h)==='re')));
 const okN=Q.filter(x=>mk(x.h)==='ok').length,WC=weakCounts(allEvents().map(x=>x.e)),due=Q.filter(x=>mk(x.h)!=='ok'&&(!db.qsrs[x.h]||db.qsrs[x.h].due<=today())).length;
 return `${mockCard()}${mockTrend()}<div class="portals">${PORTALS.map(([n,ic,c,d,u])=>`<a class="card portal" href="${u}" target="_blank" rel="noopener noreferrer"><span class="ic" style="background:${c}1f;color:${c}">${ic}</span><span><div class="t1">${n}</div><div class="t2">${d}</div></span></a>`).join('')}</div>
 ${weakHtml(Q)}
 <div class="tools"><input class="inp" id="qb" placeholder="🔍 搜索题目或公司" value="${esc(qSearch)}" style="width:280px">
  <div class="seg">${[['all','全部'],['todo','未掌握'],['re','待复习'],['ok','已掌握']].map(([k,n])=>`<button data-qf="${k}" class="${qFilter===k?'on':''}">${n}</button>`).join('')}</div>
  ${qTopic?`<button class="btn sm" data-qt="" title="取消分类筛选">${esc(qTopic)} ✕</button>`:''}<span class="t2">共 ${Q.length} 道 · 已掌握 ${okN} 道${Q.length?`（${Math.round(okN/Q.length*100)}%）`:''}</span><span style="flex:1"></span>${Q.length?`<button class="btn primary sm" data-act="review">🎴 抽卡复习${due?`（${due} 道到期）`:''}</button>`:''}${WC.length?`<button class="btn sm" data-act="weakreview" title="只练出自答得不好的面试 / 模拟场次的题目">🎯 弱项专项（最弱：${esc(WC[0].tag)} · ${WC[0].n} 次）</button>`:''}</div>
 ${L.length?L.map((x,i)=>{const m=mk(x.h);return `<div style="--n:${i}" class="card q ${m==='ok'?'ok':''}"><div class="qn"><div>${esc(x.q)}${db.qnote[x.h]?' <span title="有笔记" style="font-size:12px">📝</span>':''}${db.qsrs[x.h]?` <span class="t2" title="复习熟练度">· ${'●'.repeat(db.qsrs[x.h].box)}${'○'.repeat(5-db.qsrs[x.h].box)}</span>`:''}</div><div class="src"><a href="#" data-open="${x.a.id}">${esc(x.a.company)} · ${esc(x.e.title||EV[x.e.type])}</a></div></div>
  <div class="links">${x.url?ext(safeUrl(x.url),'原题','btn sm'):''}${Q_LINKS.map(([n,s,f])=>ext(f(x.q),n,'btn sm',`在${n}搜索这道题`)).join('')}<button class="btn sm" data-act="aians" data-h="${x.h}">✨ AI 参考答案</button></div>
  <button class="mk ${m==='re'?'re':''}" data-qm="${x.h}|re">${m==='re'?'待复习':'复习'}</button><button class="mk ${m==='ok'?'ok':''}" data-qm="${x.h}|ok">${m==='ok'?'✓ 已掌握':'掌握'}</button></div>`;}).join(''):`<div class="card empty">${Q.length?'没有符合条件的题目':'面试后在投递详情的「被问到的问题」里每行写一道题（可以附上原题链接），这里会自动汇总成你的专属题库，每道题都能一键去力扣、牛客练习或搜答案。'}</div>`}`;
}
function vSettings(){
 const notifyOK=typeof Notification!=='undefined';
 return `<div class="card set"><h3>💾 数据备份</h3><p>${sync.state==='ok'?`每次修改都会自动保存到 <b>${esc(sync.folder||'文档\\求职进度')}</b>，并且每天保留一份历史备份（最近 30 天）。即使清除了浏览器数据，下次打开也会自动恢复。`:'当前没有连接到本机备份服务，数据只保存在本应用内。请从桌面的「履迹」快捷方式打开，即可开启自动备份。'}</p>
  <div class="row"><button class="btn" data-act="backupnow" ${TOKEN?'':'disabled'}>立即备份</button><button class="btn" data-act="export">⬇ 导出备份文件</button><button class="btn" data-act="csv">📊 导出为表格（Excel）</button><button class="btn" data-act="import">⬆ 从备份文件导入</button><button class="btn" data-act="history" ${TOKEN?'':'disabled'}>🕰 历史备份</button></div></div>
 <div class="card set"><h3>⏰ 面试提醒</h3><p>开着本应用时，会在笔试 / 面试开始前 1 小时和 15 分钟提醒你。开启系统通知后，最小化窗口也能收到。</p>
  <div class="row"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" class="chk" data-set="notify" ${db.settings.notify?'checked':''} ${notifyOK?'':'disabled'}>系统通知</label>${notifyOK&&Notification.permission==='denied'?'<span class="t2">通知权限被拒绝，需要在浏览器设置里允许</span>':''}<button class="btn sm" data-act="testnotify">发送一条测试提醒</button></div>
  <div class="row" style="margin-top:8px"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" class="chk" data-set="bgNotify" ${db.settings.bgNotify!==false?'checked':''} ${TOKEN?'':'disabled'}>履迹关着时也提醒（Windows 通知，由本机小助手发出）</label></div>
  <div class="row" style="margin-top:8px"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" class="chk" data-set="digest" ${db.settings.digest!==false?'checked':''} ${TOKEN?'':'disabled'}>每天早上发一条今日汇总</label><select class="inp" data-set="digestHour" style="width:auto" ${TOKEN?'':'disabled'}>${[7,8,9,10,11].map(h=>`<option value="${h}" ${+(db.settings.digestHour??9)===h?'selected':''}>${h}:00</option>`).join('')}</select><span class="t2">今天的面试、快截止的 Offer 和岗位、该跟进的人、该复习的题</span></div></div>
 <div class="card set"><h3>ℹ️ 关于履迹</h3><p>当前版本：<b>${esc(document.querySelector('meta[name="lvji-version"]')?.content||'自用版')}</b>。拿到新的安装包后，双击里面的「安装或更新」就能升级，投递记录、简历和设置都会保留。数据保存在「文档\\求职进度」文件夹。</p></div>
 <div class="card set" id="extCard"><h3>🔗 投递自动记录（Boss直聘 · 牛客网）</h3><p>装上浏览器扩展「履迹助手」后：在 Boss直聘 网页上点「立即沟通」、在牛客网职位页「立即申请」并确认后，都会自动记到履迹（已投递）；牛客上跳去公司官网网申的，先记成「待投递」提醒你填完。Boss 的 HR 在聊天里约面试时，会自动交给 AI 识别并提醒你建日程。它只读你正在看的页面，不会替你点任何按钮，也不碰你的账号。手机 App 上的操作记不到。</p>
 <ol class="t2" style="margin:4px 0 10px;padding-left:20px;line-height:2"><li>点下面「打开扩展文件夹」</li><li>在 Edge 地址栏输入 <code>edge://extensions</code> 回车（Chrome 是 <code>chrome://extensions</code>），打开左边或右上角的「开发人员模式」</li><li>点「加载解压缩的扩展」，选刚才打开的那个文件夹</li><li>关掉履迹再从桌面打开一次，扩展就自动连上了</li></ol>
 <div class="row" style="flex-wrap:wrap;gap:8px"><button class="btn" data-act="extopen">📂 打开扩展文件夹</button><button class="btn ghost" data-act="extcopy">复制 edge://extensions</button><span class="t2" id="extStat">${TOKEN?'检查中…':''}</span></div><div id="extDiag"></div></div>
 ${TOKEN?`<div class="card set"><h3>🤖 Agent 额度（可选）</h3><p>给同时在用 AI 编程工具的人：打开后，履迹会读取本机 Claude Code、Codex、Kimi、Qoder、Gemini 等工具的用量记录，在「Agent 额度」页显示还剩多少额度。这些记录只在你电脑上读取，不会上传。和求职无关，默认关闭。</p>
 <div class="row" style="gap:8px">${agShow()?'<span class="tag" style="color:var(--ok)">✓ 已打开</span><button class="btn" data-act="agentoff">关闭</button>':'<button class="btn" data-act="agenton">打开 Agent 额度</button>'}</div></div>`:''}
 <div class="card set"><h3>🧩 力扣同步</h3><p>填上力扣（leetcode.cn）用户名，概览页会显示刷题数、提交热力图、每日一题和最近通过的题，打开履迹时和之后每 30 分钟自动同步。只读取公开主页，不需要登录，也不要密码。用户名就是个人主页网址 leetcode.cn/u/<b>这一段</b>/，直接粘贴主页网址也行。</p><div class="row" style="flex-wrap:wrap;gap:8px"><input class="inp" id="lcU" value="${esc(db.settings.lcUser||'')}" placeholder="如：zhang-san" style="width:220px"><button class="btn primary" data-act="lcsave">${db.settings.lcUser?'保存并同步':'连接'}</button>${db.settings.lcUser?'<button class="btn ghost" data-act="lcoff">断开</button>':''}<span class="t2" id="lcStat">${db.lcErr?'😵 '+esc(db.lcErr):db.lc?`✓ 已连上 ${esc(db.lc.name)}，累计 ${db.lc.solved.all} 题，${ago(db.lc.at,Date.now())}同步`:''}</span></div></div>
 <div class="card set"><h3>🤖 AI 助手</h3><p>模拟面试、识别面试邀请、按 JD 改简历、参考答案、写话术、复盘总结和公司速查都会用到。用的时候会把这次需要的内容（JD、简历、题目、复盘等）发给对应的服务，不用就不会发。首选的不可用（没余额、没登录）时会自动换下一个；公司速查要联网搜索，只能用 Claude Code 或 Codex。</p><div class="row"><span>首选</span><select class="inp" data-set="aiEngine" style="width:auto">${[['deepseek','DeepSeek（最快、最便宜）'],['claude','Claude Code'],['codex','Codex（较慢）']].map(([k,n])=>`<option value="${k}" ${(db.settings.aiEngine||'deepseek')===k?'selected':''}>${n}</option>`).join('')}</select><button class="btn sm" data-act="aitest">测试一下</button></div><div class="row" style="margin-top:8px;flex-wrap:wrap;gap:8px"><span>DeepSeek 密钥</span><input class="inp" type="password" id="dsKey" placeholder="sk-…（在 platform.deepseek.com 申请）" autocomplete="off" style="width:280px"><button class="btn sm" data-act="dskey">保存</button><span class="t2" id="dsKeyStat"></span></div><div class="row" id="aiStat" style="margin-top:8px;flex-wrap:wrap;gap:6px"><span class="t2">${TOKEN?'正在检查…':'要从桌面快捷方式打开履迹才能用 AI'}</span></div></div>
 <div class="card set"><h3>🙋 关于我</h3><p>名字、目标岗位、意向城市、期望薪资、求职开始日期和给自己的一句话，会显示在概览顶部。</p><div class="row"><button class="btn" data-act="editme">编辑</button></div></div>
 <div class="card set"><h3>🎯 每周投递目标</h3><p>概览页会显示本周进度。设为 0 则不显示。</p><div class="row"><input class="inp" type="number" min="0" max="200" data-set="weekGoal" value="${db.settings.weekGoal}" style="width:100px"> 个 / 周</div></div>
 <div class="card set"><h3>🎨 外观</h3><p>当前：${db.theme==='dark'?'深色':'浅色'}</p><div class="row"><button class="btn" data-act="theme">切换深色 / 浅色</button></div></div>
 ${db.apps.some(a=>a.sample)?`<div class="card set"><h3>🧹 示例数据</h3><p>当前有 ${db.apps.filter(a=>a.sample).length} 条示例记录。</p><div class="row"><button class="btn danger" data-act="clearsample">清除全部示例数据</button></div></div>`:''}
 <div class="card set"><h3>⌨️ 快捷键</h3><div class="kbd"><kbd>Ctrl + K</kbd><span>全局搜索：投递、人脉、故事、能力、日记、题目、页面</span><kbd>空格 / 1 2 3</kbd><span>抽卡复习时：翻面 / 忘了 / 模糊 / 记得</span><kbd>Ctrl + N</kbd><span>新增投递</span><kbd>Ctrl + V</kbd><span>不在输入框时粘贴链接或多行文字，自动新建投递</span><kbd>Esc</kbd><span>关闭面板 / 弹窗</span><kbd>1 ~ 9</kbd><span>切换左侧页面（不在输入时）</span></div></div>`;
}


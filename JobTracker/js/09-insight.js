// 履迹 · 面试后跟进、简历效果、日程冲突、公司档案、AI 教练、AI 找岗位
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 面试后跟进 · 简历效果 · 日程冲突 · 公司档案 · AI 教练 · 转写复盘 · AI 找岗位 ========== */
const idTime=id=>{const t=parseInt(String(id||'').slice(0,-5),36);return t>1.5e12&&t<4e12?t:0;}; // uid 的前半段是创建时间
/* 面试后一般几天有下文：用自己的记录算 */
function ivGapStats(){const G=[];
 for(const a of db.apps)for(const e of a.events){if(e.type!=='interview'||!e.at)continue;const t0=new Date(e.at).getTime();if(t0>Date.now())continue;
  const nxt=[...a.events.filter(x=>x!==e&&x.type!=='note').map(x=>idTime(x.id)).filter(t=>t>t0),...a.history.map(h=>new Date(h.at.replace(' ','T')).getTime()).filter(t=>t>t0)];
  if(nxt.length){const d=(Math.min(...nxt)-t0)/864e5;if(d>=0&&d<=45)G.push(d);}}
 if(G.length<3)return null;G.sort((x,y)=>x-y);const q=p=>G[Math.round(p*(G.length-1))];return {n:G.length,med:Math.max(1,Math.round(q(.5))),p80:Math.ceil(q(.8))};}
function ivStale(){const S=ivGapStats(),wait=S?Math.max(3,Math.min(14,S.p80+1)):5,now=Date.now(),L=[];
 for(const a of db.apps){if(!['interview','hr','test'].includes(a.status)||(a.snooze&&a.snooze>today()))continue;
  const past=a.events.filter(e=>(e.type==='interview'||e.type==='test')&&e.at&&new Date(e.at).getTime()<now).sort((x,y)=>y.at.localeCompare(x.at))[0];if(!past)continue;
  if(a.events.some(e=>e.at&&e.at>past.at&&e.type!=='note'))continue;const t0=new Date(past.at).getTime();
  if(a.history.some(h=>new Date(h.at.replace(' ','T')).getTime()>t0))continue;
  const days=Math.floor((now-t0)/864e5);if(days>=wait)L.push({a,e:past,days});}
 return {L,S};}
/* 哪份简历更管用 */
function resumeCard(){const G={};
 for(const a of db.apps){if(a.status==='wish'||!a.appliedAt)continue;const k=String(a.resume||'').trim()||'（没记用的哪份）';const g=G[k]=G[k]||{k,n:0,r:0,iv:0};g.n++;
  const ghost=(a.fail?.reasons||[]).includes('没回音');
  if(!ghost&&(!['applied','wish'].includes(a.status)||a.events.some(e=>e.type!=='note'&&e.type!=='followup')))g.r++;
  if(['interview','hr','offer'].includes(a.status)||a.events.some(e=>e.type==='interview')||/面/.test(a.fail?.stage||''))g.iv++;}
 const L=Object.values(G).sort((x,y)=>y.n-x.n);if(!L.length||(L.length===1&&L[0].k.startsWith('（')))return `<div class="card sec" style="margin-top:16px"><h3>📄 哪份简历更管用</h3><div class="empty">在投递详情的「投递用的简历」里记下用的是哪份，这里会按简历版本比较回复率和进面率。</div></div>`;
 const ok=L.filter(g=>g.n>=3&&!g.k.startsWith('（')),best=ok.slice().sort((x,y)=>y.iv/y.n-x.iv/x.n)[0];
 return `<div class="card sec" style="margin-top:16px"><h3>📄 哪份简历更管用<span class="m">按投递时用的简历统计，不分时间段</span></h3>${best&&ok.length>1?`<div class="alert info" style="margin-bottom:10px">进面率最高的是 <b>${esc(best.k)}</b>（${Math.round(best.iv/best.n*100)}%，${best.n} 次投递）。</div>`:''}
 <table class="rtab"><thead><tr><th>简历</th><th>投递</th><th>有回应</th><th>进面试</th></tr></thead><tbody>${L.map(g=>`<tr><td>${esc(g.k)}</td><td>${g.n}</td><td>${Math.round(g.r/g.n*100)}%<div class="rbar"><i style="width:${g.r/g.n*100}%"></i></div></td><td>${Math.round(g.iv/g.n*100)}%<div class="rbar"><i style="width:${g.iv/g.n*100}%"></i></div></td></tr>`).join('')}</tbody></table>${L.some(g=>g.n<3)?'<p class="t2" style="margin:8px 0 0">投递少于 3 次的版本，比例参考意义不大。</p>':''}</div>`;}
/* 日程冲突：同一时间段内有两场安排 */
function clashes(e,a){if(!e.at||e.done)return [];const t=new Date(e.at).getTime();return allEvents().filter(({a:x,e:y})=>y!==e&&y.at&&!y.done&&y.type!=='note'&&Math.abs(new Date(y.at).getTime()-t)<90*6e4).map(({a:x,e:y})=>`${x.company} ${y.title||EV[y.type]} ${y.at.slice(11,16)}`);}
const clashTag=(e,a)=>{if(e.type==='note')return '';const c=clashes(e,a);return c.length?`<span class="tag clash" title="前后 90 分钟内还有：${esc(c.join('、'))}">⚠ 时间冲突</span>`:'';};

/* ---------- 公司档案 ---------- */
const coKey=s=>String(s||'').trim().toLowerCase().replace(/(股份)?有限公司|集团|科技|（.*?）|\(.*?\)/g,'');
function sameCo(x,y){const a=coKey(x),b=coKey(y);return !!a&&!!b&&(a===b||a.includes(b)||b.includes(a));}
function openCompany(name){closeModal();const A=db.apps.filter(a=>sameCo(a.company,name)),P=db.people.filter(p=>sameCo(p.company,name));
 const Q=allQuestions().filter(x=>A.includes(x.a)&&!x.dup),M=db.mocks.filter(m=>A.some(a=>a.id===m.aid)),intelA=A.find(a=>a.intel);
 const ev=A.flatMap(a=>a.events.filter(e=>e.at&&e.type!=='note').map(e=>({a,e}))).sort((x,y)=>y.e.at.localeCompare(x.e.at));
 aiModal(`🏢 ${esc(name)} · 公司档案`,`<div class="co">
 <div class="co-sec"><h4 class="mdh">投过的岗位（${A.length}）</h4>${A.map(a=>`<a href="#" class="co-row" data-act="coopen" data-a="${a.id}"><b>${esc(a.role||'未填岗位')}</b>${stTag(a.status)}<span class="t2">${a.appliedAt||'未投递'}${a.channel?' · '+esc(a.channel):''}${a.resume?' · 简历：'+esc(a.resume):''}</span>${a.fail?`<span class="t2">卡在${esc(a.fail.stage)}${a.fail.reasons?.length?'（'+a.fail.reasons.map(esc).join('、')+'）':''}</span>`:''}</a>`).join('')}</div>
 ${ev.length?`<div class="co-sec"><h4 class="mdh">面试经过</h4>${ev.map(({a,e})=>`<div class="co-ev"><span class="t2">${e.at.slice(0,16).replace('T',' ')}</span> <b>${esc(e.title||EV[e.type])}</b> <span class="t2">${esc(a.role)}</span>${e.rating?` <span class="t2">${'★'.repeat(e.rating)}</span>`:''}${e.weak?.length?` <span class="t2">薄弱：${e.weak.map(esc).join('、')}</span>`:''}${e.review?`<div class="t2 co-rv">${esc(e.review.slice(0,240))}</div>`:''}</div>`).join('')}</div>`:''}
 ${Q.length?`<div class="co-sec"><h4 class="mdh">被问过的题（${Q.length}）</h4><ol class="co-q">${Q.map(x=>`<li>${esc(x.q)}${db.qmark[x.h]==='ok'?' <span class="t2">✓ 已掌握</span>':''}</li>`).join('')}</ol></div>`:''}
 ${M.length?`<div class="co-sec"><h4 class="mdh">针对这家的模拟面试</h4>${M.map(m=>`<a href="#" class="mkitem" data-act="mkview" data-id="${m.id}"><b>${+m.report?.score||0}</b><span>${esc(m.kind.split('：')[0])}</span><span class="t2">${esc(m.at.slice(0,10))}</span></a>`).join('')}</div>`:''}
 ${P.length?`<div class="co-sec"><h4 class="mdh">认识的人</h4>${P.map(p=>`<div class="co-ev"><b>${esc(p.name)}</b> <span class="t2">${esc(p.title||'')}${p.rel?' · '+esc(p.rel):''}${p.contact?' · '+esc(p.contact):''}${p.nextAt?' · 下次跟进 '+p.nextAt:''}</span></div>`).join('')}</div>`:''}
 ${intelA?`<div class="co-sec"><h4 class="mdh">公司速查 <span class="t2">${esc(intelA.intel.at.slice(0,10))}</span></h4><details class="intel"><summary>展开</summary><div class="aiout">${md(intelA.intel.text)}</div></details></div>`:''}
 </div><div class="mfoot">${A[0]?`<button class="btn" data-act="intel" data-a="${A[0].id}" style="margin-right:auto">🔎 ${intelA?'重新':''}联网速查</button><button class="btn" data-act="mock" data-a="${A[0].id}">🎙 针对这家模拟面试</button>`:''}<button class="btn primary" data-act="mclose">好的</button></div>`,'coBox');}

/* ---------- AI 求职教练（对话） ---------- */
let CHAT=null;
const CHAT_SUG=['这周我该优先准备什么？','帮我分析一下我总是挂在哪','下一场面试怎么准备？','这几个 Offer 我该怎么选？','帮我定一个接下来两周的投递计划'];
function chatCtx(){const P=db.settings.profile||{},now=nowLocal(),sent=db.apps.filter(a=>a.status!=='wish');
 const act=db.apps.filter(a=>!['rejected','dropped'].includes(a.status)).sort((x,y)=>y.updatedAt-x.updatedAt).slice(0,30)
  .map(a=>`- ${a.company} · ${a.role} · ${SM[a.status].n}${a.appliedAt?' · 投递 '+a.appliedAt:''}${a.offer&&annual(a.offer)?' · 年包约 '+fmtK(annual(a.offer)):''}${a.offer?.deadline?' · Offer 截止 '+a.offer.deadline:''}`).join('\n');
 const up=allEvents().filter(({e})=>!e.done&&e.at&&e.at>=now).sort((x,y)=>x.e.at.localeCompare(y.e.at)).slice(0,10).map(({a,e})=>`- ${e.at.replace('T',' ')} ${a.company} ${e.title||EV[e.type]}`).join('\n');
 const rec=allEvents().filter(({e})=>e.type==='interview'&&e.at&&e.at<now).sort((x,y)=>y.e.at.localeCompare(x.e.at)).slice(0,8).map(({a,e})=>`- ${e.at.slice(0,10)} ${a.company} ${e.title||'面试'}${e.rating?' 自评'+e.rating+'/5':''}${e.weak?.length?' 薄弱：'+e.weak.join('、'):''}${e.review?' 复盘：'+e.review.slice(0,100):''}`).join('\n');
 const fails=db.apps.filter(a=>a.status==='rejected'&&a.fail).slice(-12).map(a=>`- ${a.company} 卡在${a.fail.stage}${a.fail.reasons?.length?'（'+a.fail.reasons.join('、')+'）':''}`).join('\n');
 const sk=db.skills.map(s=>`${s.name} ${LVN[+s.level||0]}`).join('、'),mocks=db.mocks.slice(-5).map(m=>`${m.at.slice(0,10)} ${m.kind.split('：')[0]} ${m.report?.score||0} 分`).join('；');
 const ws=weekStart(),weekN=sent.filter(a=>a.appliedAt&&new Date(a.appliedAt+'T00:00')>=ws).length;
 return `今天是 ${today()}（星期${WK[new Date().getDay()]}），现在 ${now.slice(11)}。
【求职者】${P.name||'（未填名字）'}；目标：${P.target||'未填'}；城市：${P.cities||'未填'}；期望薪资：${P.salary||'未填'}；求职第 ${huntDays()} 天。
【整体】累计投递 ${sent.length} 个，本周 ${weekN} 个（目标 ${db.settings.weekGoal||'未设'}），进行中 ${db.apps.filter(a=>ACTIVE.includes(a.status)).length} 个，Offer ${db.apps.filter(a=>a.status==='offer').length} 个。
【进行中的投递】\n${act||'无'}
【接下来的安排】\n${up||'无'}
【最近的面试】\n${rec||'无'}
【未通过记录】\n${fails||'无'}
【能力树】${sk||'未填'}
【薄弱点统计】${weakCtx()||'暂无'}
【模拟面试】${mocks||'没练过'}
【力扣刷题】${lcCtx()}`;}
function openChat(q){closeModal();CHAT=CHAT||{msgs:(db.chat||[]).slice(-20),busy:false,err:''};aiModal('💬 问问求职教练','','chat');renderChat();if(q)chatSend(q);else setTimeout(()=>document.getElementById('chatIn')?.focus(),30);}
function renderChat(){const b=document.getElementById('aiBody');if(!b||!CHAT)return;
 b.innerHTML=`<div class="chatlog" id="chatLog">${CHAT.msgs.length?'':`<p class="t2">它能看到你在履迹里的投递、日程、面试复盘、未通过记录、能力树和模拟面试成绩，可以直接问。</p><div class="quick">${CHAT_SUG.map(s=>`<button class="hb" data-act="chatq" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}
 ${CHAT.msgs.map(m=>`<div class="cm ${m.role}">${m.role==='user'?esc(m.content).replace(/\n/g,'<br>'):md(m.content)}</div>`).join('')}${CHAT.busy?aiLoading('在想…'):''}${CHAT.err?`<div class="alert">😵 ${esc(CHAT.err)}</div>`:''}</div>
 <div class="chatin"><textarea class="inp" id="chatIn" rows="2" placeholder="问点什么，Enter 发送，Shift + Enter 换行" ${CHAT.busy?'disabled':''}></textarea><button class="btn primary" data-act="chatsend" ${CHAT.busy?'disabled':''}>发送</button></div>
 <div class="t2 chatfoot">${CHAT.msgs.length?'<a href="#" data-act="chatclear">清空对话</a> · ':''}对话会保存在本机，最多留最近 20 条</div>`;
 const l=document.getElementById('chatLog');if(l)l.scrollTop=l.scrollHeight;}
async function chatSend(q){if(!CHAT||CHAT.busy)return;q=String(q??document.getElementById('chatIn')?.value??'').trim();if(!q)return;
 CHAT.msgs.push({role:'user',content:q});CHAT.busy=true;CHAT.err='';renderChat();const tk=AIREQ;
 try{const t=await ai({system:`你是求职者的私人求职教练，说中文，直接、具体、可执行，像一个了解情况的朋友。回答要基于下面的真实数据，引用具体公司和日期；数据里没有的不要编造，需要时反问。篇幅适中，用 Markdown。\n\n${chatCtx()}`,messages:CHAT.msgs.slice(-12),max:1500,temperature:.6});
  if(!CHAT||tk!==AIREQ)return;CHAT.msgs.push({role:'assistant',content:t});}
 catch(e){if(!CHAT||tk!==AIREQ)return;CHAT.err=e.message;CHAT.msgs.pop();setTimeout(()=>{const i=document.getElementById('chatIn');if(i)i.value=q;},0);}
 CHAT.busy=false;db.chat=CHAT.msgs.slice(-20);persist();renderChat();setTimeout(()=>document.getElementById('chatIn')?.focus(),30);}

/* ---------- 面试转写 → 自动复盘 ---------- */
let LISTEN=null;
function openListen(aid,eid){const a=appById(aid),e=a?.events.find(x=>x.id===eid);if(!e)return;closeModal();LISTEN={aid,eid,text:'',rec:null,on:false};
 aiModal(`🎙 ${esc(a.company)} · ${esc(e.title||'面试')} · 转写复盘`,'','listen');renderListen();}
function renderListen(){const b=document.getElementById('aiBody');if(!b||!LISTEN)return;
 b.innerHTML=`<p class="t2" style="margin:0 0 8px">两种方式：① 面试结束后，把腾讯会议、飞书妙记等导出的文字稿粘进来；② 面试时点「开始转写」，用麦克风实时转成文字（只能收到麦克风里的声音）。然后 AI 会提取被问到的题、找出没答好的地方，自动填好复盘。</p>
 <textarea class="inp" id="lsT" rows="11" placeholder="把面试文字稿粘贴到这里…">${esc(LISTEN.text)}</textarea>
 <div class="mfoot">${SR?`<button class="btn" data-act="lsrec" style="margin-right:auto">${LISTEN.on?'⏹ 停止转写':'🎙 开始转写'}</button>`:'<span style="margin-right:auto"></span>'}<button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="lsgo">AI 提取并复盘</button></div>`;}
function lsRec(){if(!SR||!LISTEN)return;const t=document.getElementById('lsT');if(LISTEN.on){LISTEN.rec?.stop();LISTEN.on=false;LISTEN.text=t.value;renderListen();return;}
 const base=t.value;const r=new SR();r.lang='zh-CN';r.continuous=true;r.interimResults=true;LISTEN.rec=r;LISTEN.on=true;
 r.onresult=ev=>{let s='';for(const x of ev.results)s+=x[0].transcript+(x.isFinal?'\n':'');const el=document.getElementById('lsT');if(el){el.value=(base?base+'\n':'')+s;el.scrollTop=el.scrollHeight;}if(LISTEN)LISTEN.text=(base?base+'\n':'')+s;};
 r.onend=()=>{if(LISTEN&&LISTEN.on){try{r.start();}catch{}}}; // 浏览器会自己停，转写中就接着听
 r.onerror=ev=>{if(ev.error==='not-allowed'){toast('没有麦克风权限');if(LISTEN)LISTEN.on=false;renderListen();}};
 try{r.start();}catch{}renderListen();}
async function lsGo(){if(!LISTEN)return;if(LISTEN.on){LISTEN.on=false;LISTEN.rec?.stop();}const t=(document.getElementById('lsT')?.value||LISTEN.text||'').trim();if(t.length<30)return toast('文字太少，先粘贴或转写面试内容');
 LISTEN.text=t;const a=appById(LISTEN.aid),e=a.events.find(x=>x.id===LISTEN.eid),tk=AIREQ,L=LISTEN;document.getElementById('aiBody').innerHTML=aiLoading('正在从文字稿里提取问题、分析回答…');
 try{const j=await ai({system:'你是资深面试官，正在帮候选人复盘一场真实面试的文字稿（可能是语音转写，有错别字和断句问题，按意思理解）。只根据文字稿，不要编造。中文。',prompt:`公司：${a.company}，岗位：${a.role}，轮次：${e.title||'面试'}\n文字稿：\n${t.slice(0,24000)}\n\n只输出 JSON：{"questions":["面试官问的每个问题，一行一个，改写成清楚完整的问句"],"rating":按候选人整体表现给 1～5 分,"weak":["从这些标签里选 0～3 个：${WEAK_RS.join('、')}"],"review":"复盘笔记：哪几题没答好、该怎么答、下次注意什么，4～8 行，每行以「· 」开头"}`,json:true,max:2500,temperature:.3});
  if(tk!==AIREQ)return;
  openRv(L.aid,L.eid);if(!RV)return;RV.rating=Math.max(1,Math.min(5,+j.rating||RV.rating||3));RV.questions=[RV.questions,...(j.questions||[])].filter(Boolean).join('\n');RV.weak=[...new Set([...RV.weak,...(j.weak||[]).filter(w=>WEAK_RS.includes(w))])];RV.review=[RV.review,j.review].filter(Boolean).join('\n');RV.step=1;renderRv();
  toast(`AI 提取了 ${(j.questions||[]).length} 道题，看一下没问题就下一步、保存`,null,6000);}
 catch(e2){if(tk===AIREQ)document.getElementById('aiBody').innerHTML=aiErr(e2,'lsback');}}

/* ---------- AI 找岗位（联网搜索） ---------- */
let HUNT=null;const HUNT_RUN={on:false};
function openHunt(){closeModal();const P=db.settings.profile||{};
 if(HUNT&&HUNT.jobs&&!HUNT_RUN.on)return huntShow();
 aiModal('🧭 AI 找岗位',`<p class="t2" style="margin:0 0 10px">AI 会联网搜索 Boss 直聘、牛客、公司官网等公开的招聘信息，找出合适的岗位，选中就能加进「待投递」。大概要 2～4 分钟，可以关掉窗口，找好了会提醒你。</p>
 <div class="fg"><div class="f"><label>目标岗位</label><input class="inp" id="huR" value="${esc(P.target||'Java 后端开发')}"></div><div class="f"><label>城市</label><input class="inp" id="huC" value="${esc(P.cities||'')}" placeholder="如：杭州 / 上海，不限就空着"></div>
 <div class="f"><label>类型</label><select class="inp" id="huT"><option>校招 / 应届</option><option>实习</option><option>社招 1～3 年</option><option>社招 3 年以上</option></select></div><div class="f"><label>期望薪资</label><input class="inp" id="huS" value="${esc(P.salary||'')}"></div>
 <div class="f full"><label>其他要求（可不填）</label><input class="inp" id="huX" placeholder="如：想去中大厂、不要外包、偏好电商或支付方向"></div></div>
 ${HUNT_RUN.on?'<div class="alert info">上一次的搜索还在进行，好了会提醒你。</div>':''}
 <div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="huntgo" ${HUNT_RUN.on?'disabled':''}>开始找</button></div>`,'hunt');}
async function huntGo(){if(HUNT_RUN.on)return;const g=id=>document.getElementById(id)?.value.trim()||'',q={role:g('huR'),city:g('huC'),type:g('huT'),salary:g('huS'),extra:g('huX')};
 if(!q.role)return toast('先填目标岗位');HUNT_RUN.on=true;closeModal();toast('开始联网找岗位，大概 2～4 分钟，好了会提醒你',null,5000);
 const have=db.apps.map(a=>a.company+' '+a.role).slice(-80).join('；');
 try{const j=await ai({web:true,system:'你是求职调研助手。必须用网络搜索查找真实、目前仍在招聘的岗位，只列查得到来源链接的岗位，绝不编造公司、岗位或链接。中文。',prompt:`帮我找 8～12 个合适的岗位。\n目标岗位：${q.role}\n城市：${q.city||'不限'}\n类型：${q.type}\n期望薪资：${q.salary||'不限'}\n其他要求：${q.extra||'无'}\n我的技能：${db.skills.map(s=>s.name).join('、')||'未填'}\n已经在跟进的（不要重复）：${have||'无'}\n今天是 ${today()}，优先找最近一个月发布或仍开放的。\n\n只输出 JSON：{"jobs":[{"company":"公司","role":"岗位名称","city":"城市","salary":"薪资（查不到留空）","link":"岗位或招聘页链接","channel":"来源网站","deadline":"网申截止日期 YYYY-MM-DD，没有留空","why":"为什么适合我，一句话","jd":"岗位要求摘要，2～4 句"}]}`,json:true,max:5000});
  HUNT={q,at:nowLocal(),jobs:(j.jobs||[]).filter(x=>x&&x.company&&x.role&&!(/^\d{4}-\d\d-\d\d$/.test(x.deadline||"")&&x.deadline<today())).slice(0,15),engine:AIL.engine};toast(`找到 ${HUNT.jobs.length} 个岗位`,['查看',()=>huntShow()],15000);}
 catch(e){toast('😵 找岗位失败：'+e.message,null,8000);}finally{HUNT_RUN.on=false;}}
function huntShow(){if(!HUNT)return openHunt();closeModal();const has=x=>db.apps.some(a=>sameCo(a.company,x.company)&&coKey(a.role)===coKey(x.role));
 aiModal('🧭 AI 找到的岗位',`<div class="t2" style="margin-bottom:8px">${esc(HUNT.q.role)}${HUNT.q.city?' · '+esc(HUNT.q.city):''} · ${esc(HUNT.at.replace('T',' '))} · 由 ${AI_NAME[HUNT.engine]} 联网搜索。链接请自己点开核实一下是否还在招。</div>
 ${HUNT.jobs.length?HUNT.jobs.map((x,i)=>`<label class="hj ${has(x)?'have':''}"><input type="checkbox" data-hj="${i}" ${has(x)?'disabled':''}><div><div class="t1">${esc(x.company)} · ${esc(x.role)}${has(x)?' <span class="t2">已在跟进</span>':''}</div><div class="t2">${[x.city,x.salary,x.channel,x.deadline&&('截止 '+x.deadline)].filter(Boolean).map(esc).join(' · ')}${/^https?:\/\//.test(x.link||'')?` · <a href="${esc(x.link)}" target="_blank" rel="noopener noreferrer">打开链接 ↗</a>`:''}</div>${x.why?`<div class="hjwhy">${esc(x.why)}</div>`:''}</div></label>`).join(''):'<div class="empty">没找到合适的，换个条件再试试。</div>'}
 <div class="mfoot"><button class="btn" data-act="huntnew" style="margin-right:auto">换个条件</button><button class="btn" data-act="mclose">关闭</button><button class="btn primary" data-act="huntadd">加进待投递</button></div>`,'hunt');}
function huntAdd(){const sel=[...document.querySelectorAll('[data-hj]:checked')].map(c=>HUNT.jobs[+c.dataset.hj]);if(!sel.length)return toast('先勾选要加的岗位');
 for(const x of sel){const link=/^https?:\/\//.test(x.link||'')?x.link:'';const ch=/zhipin/.test(link)?'Boss直聘':/lagou/.test(link)?'拉勾':/liepin/.test(link)?'猎聘':/nowcoder/.test(link)?'牛客':CH.includes(x.channel)?x.channel:'官网';
  const a=newApp({company:x.company,role:x.role,city:x.city||'',salary:x.salary||'',link,channel:ch,status:'wish',appliedAt:'',due:/^\d{4}-\d\d-\d\d$/.test(x.deadline||'')?x.deadline:'',notes:[x.jd,x.why&&('AI 推荐理由：'+x.why)].filter(Boolean).join('\n')});logStatus(a,'',a.status);db.apps.push(a);}
 persist();closeModal();render();skHit(innerWidth/2,innerHeight/2-60,'pon');toast(`已加进待投递 ${sel.length} 个`,['去看板',()=>{view='board';render();}]);}
async function extStatusFill(){const el=document.getElementById('extStat');if(!el||!TOKEN)return;
 try{const s=await (await fetch('http://127.0.0.1:47321/api/ext/status',{headers:{'x-token':TOKEN},cache:'no-store'})).json();
  el.innerHTML=s.seen?`<span style="color:var(--ok)">✓ 扩展已连上</span>（${ago(s.seen,Date.now())}${s.ver?' · v'+esc(s.ver):''}）`:s.dir?'还没检测到扩展：装好后关掉履迹再打开一次':'这个版本没带扩展文件';
  // 扩展的自检记录：最近两周没记上的情况
  const D=(s.diag||[]).filter(d=>Date.now()-d.at<14*864e5),box=document.getElementById('extDiag');
  if(box)box.innerHTML=D.length?`<div class="alert" style="margin-top:10px;display:block"><b>⚠ 最近有 ${D.length} 次没记上</b><span class="t2">（网站改版或履迹没开时会出现；把下面复制发给维护的人就能修）</span>${D.slice(0,5).map(d=>`<div class="t2" style="margin-top:4px">${ago(d.at,Date.now())} · <b>${esc(d.site)}</b> · ${esc(d.stage)}：${esc(d.why)}</div>`).join('')}<button class="btn sm" style="margin-top:8px" data-act="extdiagcopy">📋 复制诊断信息</button></div>`:'';
  EXT_DIAG=D;}catch{el.textContent='';}}
let EXT_DIAG=[];

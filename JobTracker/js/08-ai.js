// 履迹 · 未通过记录、复盘向导、AI 助手（模拟面试、识别邀请、话术）
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 未通过记录 · 面试复盘向导 · 各渠道回复速度 ========== */
const FAIL_ST=['简历筛选','笔试/测评','一面','二面','三面及以上','HR 面','Offer 谈判'];
const FAIL_RS=['算法题','八股基础','项目深挖','系统设计','场景题','表达沟通','经验不够','学历/背景','薪资没谈拢','岗位不匹配','没回音','不清楚'];
const WEAK_RS=['算法题','八股基础','项目深挖','系统设计','场景题','表达沟通','紧张卡壳','反问没准备'];
const RS_TOPIC={'算法题':'算法与数据结构','系统设计':'分布式 / 系统设计','项目深挖':'项目与行为'};
const RS_SKILL={'算法题':'算法','八股基础':'Java 基础','系统设计':'系统设计','场景题':'场景设计','项目深挖':'项目表达','表达沟通':'表达沟通'};
function guessStage(a,old){if(old==='hr')return 'HR 面';if(old==='offer')return 'Offer 谈判';
 const iv=a.events.filter(e=>e.type==='interview'&&e.at&&e.at<=nowLocal()).length;
 if(iv>=3)return '三面及以上';if(iv===2)return '二面';if(iv===1||old==='interview')return '一面';
 if(old==='test'||a.events.some(e=>e.type==='test'))return '笔试/测评';return '简历筛选';}
function lastFrom(a){const h=a.history.filter(h=>h.to==='rejected').at(-1);return h?h.from:'';}
function openFail(a,old){const x=Object.assign({stage:guessStage(a,old??lastFrom(a)),reasons:[],note:''},a.fail||{});
 openForm(`${a.company} · 卡在哪一步？`,[['stage','卡在哪一轮','select',FAIL_ST],['reasons','主要原因（可多选，不确定就选「不清楚」）','checks',FAIL_RS,true],['note','补一句（可不填）','textarea','如：二面问分布式锁续期，没答上来',true]],x,
  o=>{a.fail={stage:o.stage,reasons:o.reasons,note:o.note,at:today()};touch(a);setTimeout(()=>{if(openId===a.id)renderDrawer();},0);toast('记下了，复盘页的「卡在哪 · 为什么」会帮你找规律');});
 document.querySelector('#mbox h3')?.insertAdjacentHTML('afterend','<p class="t2" style="margin:-4px 0 10px">攒几次就能看出总在哪一轮、因为什么挂。不想记就点「取消」。</p>');}
function failCard(){const S={},R={};let n=0,un=0;
 const addR=(r,c)=>{(R[r]=R[r]||{n:0,from:new Set()}).n++;R[r].from.add(c);};
 for(const a of db.apps){if(a.status==='rejected'){if(a.fail){n++;S[a.fail.stage]=(S[a.fail.stage]||0)+1;for(const r of a.fail.reasons||[])addR(r,a.company);}else un++;}
  for(const e of a.events)for(const r of e.weak||[])addR(r,a.company);}
 for(const m of db.mocks)if(!m.aid)for(const r of m.report?.weak||[])addR(r,'模拟面试');
 const rs=Object.entries(R).filter(([k])=>k!=='不清楚'&&k!=='没回音').sort((x,y)=>y[1].n-x[1].n),st=FAIL_ST.map(s=>[s,S[s]||0]).filter(x=>x[1]);
 const smax=Math.max(1,...st.map(x=>x[1])),rmax=Math.max(1,...rs.map(x=>x[1].n));
 const head=`<h3>🔍 卡在哪 · 为什么<span class="m">来自未通过记录和面试复盘，不分时间段</span></h3>`,more=un?`<p class="t2" style="margin:10px 0 0">还有 ${un} 条未通过的投递没记原因，<a href="#" data-act="failnext">补一条</a>。</p>`:'';
 if(!st.length&&!rs.length)return `<div class="card sec" style="margin-top:16px">${head}<div class="empty">还没有记录。把投递标成「未通过」时记一下卡在哪一轮，面试后做一次 3 步复盘，攒几次这里就能看出规律。</div>${more}</div>`;
 const topS=st.slice().sort((x,y)=>y[1]-x[1])[0],topR=rs[0];
 const tip=[topS&&topS[1]>=2?`最常卡在 <b>${esc(topS[0])}</b>（${topS[1]} 次）`:'',topR&&topR[1].n>=2?`最常见的原因是 <b>${esc(topR[0])}</b>（${topR[1].n} 次）`:''].filter(Boolean).join('，');
 const fix=r=>[RS_TOPIC[r]?`<a href="#" data-act="failtopic" data-t="${esc(RS_TOPIC[r])}">看题</a>`:'',RS_SKILL[r]&&!db.skills.some(s=>s.name===RS_SKILL[r])?`<a href="#" data-act="failskill" data-s="${esc(RS_SKILL[r])}">加进能力树</a>`:''].filter(Boolean).join(' · ');
 return `<div class="card sec" style="margin-top:16px">${head}${tip?`<div class="alert info" style="margin-bottom:12px">${tip}。</div>`:''}
 <div class="grid two"><div><div class="t2" style="margin-bottom:4px">卡在哪一轮 · ${n} 条记录</div>${st.length?st.map(([s,c])=>`<div class="chl w"><span>${esc(s)}</span><div class="bar"><i style="width:${c/smax*100}%"></i></div><span class="r">${c} 次</span></div>`).join(''):'<div class="t2">暂无</div>'}</div>
 <div><div class="t2" style="margin-bottom:4px">原因和薄弱点</div>${rs.length?rs.map(([r,x])=>`<div class="chl w" title="${esc([...x.from].join('、'))}"><span>${esc(r)}</span><div class="bar"><i style="width:${x.n/rmax*100}%"></i></div><span class="r">${x.n} 次${fix(r)?' · '+fix(r):''}</span></div>`).join(''):'<div class="t2">暂无</div>'}</div></div>${more}</div>`;}
/* 面试后 3 步复盘 */
let RV=null;
const RATE=[['😵','很差'],['😟','不太好'],['😐','一般'],['🙂','还行'],['😎','很好']];
function openRv(aid,eid){const a=appById(aid),e=a?.events.find(x=>x.id===eid);if(!e)return;closeModal();
 RV={aid,eid,step:0,rating:+e.rating||0,questions:e.questions||'',weak:(e.weak||[]).slice(),review:e.review||''};document.getElementById('modal').classList.add('on');renderRv();}
function rvGrab(){const q=document.getElementById('rvQ'),n=document.getElementById('rvN');if(q)RV.questions=q.value;if(n)RV.review=n.value;}
function renderRv(){const a=appById(RV.aid),e=a?.events.find(x=>x.id===RV.eid);if(!e)return closeModal();const b=document.getElementById('mbox');b.className='card mbox rvw';
 const steps=['感觉如何','问了什么','哪里没答好'];let body='';
 if(RV.step===0)body=`<p class="t1 rvq">这场面试整体感觉怎么样？</p><div class="quick">${RATE.map(([ic,t],i)=>`<button class="hb ${RV.rating===i+1?'on':''}" data-rvrate="${i+1}">${ic} ${t}</button>`).join('')}</div>`;
 else if(RV.step===1)body=`<p class="t1 rvq">被问了哪些题？</p><p class="t2" style="margin:0 0 8px">每行一题，保存后自动进面试题库，按间隔提醒你复习。</p><textarea class="inp" id="rvQ" rows="8" placeholder="Redis 为什么快&#10;MySQL 索引什么时候失效&#10;手写 LRU">${esc(RV.questions)}</textarea><div style="margin-top:8px"><button class="btn sm" data-act="listen" data-a="${RV.aid}" data-e="${RV.eid}">🎙 有文字稿？粘贴进来让 AI 提取</button></div>`;
 else body=`<p class="t1 rvq">哪里没答好？</p><p class="t2" style="margin:0 0 8px">可多选，会算进复盘页的「卡在哪 · 为什么」。都答得不错就直接保存。</p><div class="quick">${WEAK_RS.map(r=>`<button class="hb ${RV.weak.includes(r)?'on':''}" data-rvweak="${esc(r)}">${esc(r)}</button>`).join('')}</div><div class="f" style="margin-top:12px"><label>复盘笔记（下次怎么答更好）</label><textarea class="inp" id="rvN" rows="4" placeholder="如：分布式锁续期要讲 watchdog；讲项目先说结果再说过程">${esc(RV.review)}</textarea></div>`;
 b.innerHTML=`<h3 style="margin:0 0 2px">📝 ${esc(a.company)} · ${esc(e.title||'面试')} 复盘</h3><div class="t2">${e.at?e.at.replace('T',' ')+' · ':''}3 步，大约 2 分钟</div><div class="rvsteps">${steps.map((s,i)=>`<span class="${i===RV.step?'on':i<RV.step?'ok':''}">${i<RV.step?'✓':i+1} ${s}</span>`).join('')}</div>${body}
 <div class="mfoot">${RV.step?'<button class="btn" data-act="rvprev" style="margin-right:auto">上一步</button>':'<button class="btn ghost" data-act="mclose" style="margin-right:auto">稍后再说</button>'}${RV.step<2?'<button class="btn primary" data-act="rvnext">下一步</button>':'<button class="btn primary" data-act="rvsave">保存复盘</button>'}</div>`;
 if(RV.step===1)setTimeout(()=>document.getElementById('rvQ')?.focus(),30);}
function rvSave(){rvGrab();const a=appById(RV.aid),e=a?.events.find(x=>x.id===RV.eid);if(!e)return closeModal();
 const before=new Set(allQuestions().map(x=>x.h));
 Object.assign(e,{rating:RV.rating||+e.rating||0,questions:RV.questions.trim(),weak:RV.weak,review:RV.review.trim(),done:true,rvAsked:true});touch(a);
 const added=allQuestions().filter(x=>!before.has(x.h)).length;closeModal();render();if(openId===a.id)renderDrawer();
 skHit(innerWidth/2,innerHeight/2-60,'pon');toast(added?`复盘已保存，${added} 道题进了题库`:'复盘已保存');}
function rvPrompt(){if(document.getElementById('modal').classList.contains('on'))return;const now=Date.now();
 for(const {a,e} of allEvents()){if(e.type!=='interview'||!e.at||e.rvAsked||e.review||e.questions)continue;const m=(now-new Date(e.at).getTime())/6e4;
  if(m>=60&&m<=36*60){e.rvAsked=true;touch(a);toast(`📝 ${a.company} 的「${e.title||'面试'}」结束了，趁记得清楚做个 3 步复盘？`,['现在复盘',()=>openRv(a.id,e.id)],15000);return;}}}
/* 各渠道多久会有回音：用自己的投递记录算 */
function replyDays(a){if(!a.appliedAt||a.status==='wish'||(a.fail?.reasons||[]).includes('没回音'))return null;
 const h=a.history.find(h=>h.from==='applied'&&h.to!=='wish');if(!h)return null;const d=dayDiff(h.at.slice(0,10),a.appliedAt);return d>=0&&d<=60?d:null;}
function replyStats(){const by={},all=[];for(const a of db.apps){const d=replyDays(a);if(d==null)continue;(by[a.channel]=by[a.channel]||[]).push(d);all.push(d);}
 const q=(L,p)=>{const s=L.slice().sort((x,y)=>x-y);return s[Math.round(p*(s.length-1))];},mk=L=>L.length>=3?{n:L.length,med:q(L,.5),p80:q(L,.8)}:null;
 const R={_all:mk(all)};for(const k in by)R[k]=mk(by[k]);return R;}
function waitFor(ch,RS){const x=RS[ch]||RS._all;return x?{d:Math.max(3,Math.min(21,x.p80+2)),x,own:!!RS[ch]}:{d:7};}
/* ========== AI 助手：通过本机小助手调用 DeepSeek / Claude Code / Codex ========== */
const AI_URL='http://127.0.0.1:47321/api/ai',AI_NAME={deepseek:'DeepSeek',claude:'Claude Code',codex:'Codex'};
let AIL=null,AIREQ=0,aiT0=0,aiIv=0;
async function ai(o){if(!TOKEN)throw new Error('要从桌面的「履迹」快捷方式打开，才能用 AI');
 let r;try{r=await fetch(AI_URL,{method:'POST',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify({...o,engine:db.settings.aiEngine||'deepseek'})});}catch{throw new Error('连不上本机小助手，从桌面快捷方式重新打开履迹试试');}
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`AI 请求失败（${r.status}）`);
 AIL={engine:j.engine,skipped:j.skipped||[]};return o.json?aiJSON(j.text):j.text;}
function aiJSON(t){t=String(t).replace(/^\s*```(?:json)?\s*|\s*```\s*$/g,'').trim();try{return JSON.parse(t);}catch{const m=t.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0]);}catch{}throw new Error('AI 返回的格式不对，再试一次');}}
function aiWho(){return AIL?`<div class="t2 aiwho">由 ${AI_NAME[AIL.engine]} 生成${AIL.skipped.length?`（${esc(AIL.skipped.join('，'))}，已自动换用）`:''}</div>`:'';}
function aiSlow(){return (db.settings.aiEngine||'deepseek')!=='deepseek'||(AIL&&AIL.engine!=='deepseek');}
function aiLoading(msg){clearInterval(aiIv);aiT0=Date.now();aiIv=setInterval(()=>{const el=document.getElementById('aiTick');if(!el)return clearInterval(aiIv);el.textContent=`已等待 ${Math.round((Date.now()-aiT0)/1000)} 秒${aiSlow()?' · 用命令行工具时一般要 20～60 秒':''}`;},1000);
 return `<div class="aiload"><span class="aispin"></span><div><div class="t1">${esc(msg)}</div><div class="t2" id="aiTick">已等待 0 秒</div></div></div>`;}
function aiModal(title,inner,cls=''){const b=document.getElementById('mbox');b.className='card mbox aim '+cls;b.innerHTML=`<h3>${title}</h3><div id="aiBody">${inner}</div>`;document.getElementById('modal').classList.add('on');return ++AIREQ;}
const aiLive=tk=>tk===AIREQ&&document.getElementById('modal').classList.contains('on');
function aiErr(e,retry){return `<div class="alert" style="margin:6px 0 12px">😵 ${esc(e.message||e)}</div><div class="mfoot"><button class="btn" data-act="mclose">关闭</button>${retry?`<button class="btn primary" data-act="${retry}">再试一次</button>`:''}</div>`;}
// 轻量 Markdown：标题、粗体、行内代码、列表、引用、代码块、链接
function md(s){const out=[];let list=null,code=false;const close=()=>{if(list){out.push(`</${list}>`);list=null;}};
 const inl=x=>x.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,(m,t,u)=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`)
  .replace(/(^|[\s（(：:])(https?:\/\/[^\s<）)]+)/g,(m,p,u)=>`${p}<a href="${u}" target="_blank" rel="noopener noreferrer">${u.length>48?u.slice(0,46)+'…':u}</a>`);
 for(const raw of esc(s).split(/\r?\n/)){const l=raw.trimEnd();let m;
  if(/^\s*```/.test(l)){close();out.push(code?'</pre>':'<pre>');code=!code;continue;}
  if(code){out.push(l+'\n');continue;}
  if(m=l.match(/^(#{1,4})\s+(.*)/)){close();out.push(`<h4 class="mdh">${inl(m[2])}</h4>`);}
  else if(m=l.match(/^\s*[-*•]\s+(.*)/)){if(list!=='ul'){close();out.push('<ul>');list='ul';}out.push(`<li>${inl(m[1])}</li>`);}
  else if(m=l.match(/^\s*\d+[.、)]\s*(.*)/)){if(list!=='ol'){close();out.push('<ol>');list='ol';}out.push(`<li>${inl(m[1])}</li>`);}
  else if(m=l.match(/^&gt;\s?(.*)/)){close();out.push(`<blockquote>${inl(m[1])}</blockquote>`);}
  else if(/^\s*(-{3,}|\|?\s*:?-{3,})/.test(l)){close();}
  else if(/^\|.*\|$/.test(l)){close();out.push(`<div class="mdrow">${l.slice(1,-1).split('|').map(c=>`<span>${inl(c.trim())}</span>`).join('')}</div>`);}
  else if(!l.trim())close();
  else{close();out.push(`<p>${inl(l)}</p>`);}}
 close();if(code)out.push('</pre>');return `<div class="md">${out.join('')}</div>`;}
const fmtAI=x=>esc(x).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
function aiTarget(a){const P=db.settings.profile||{};return a&&a.role?a.role:(P.target||'后端开发');}
function appCtx(a){if(!a)return '';return `公司：${a.company}\n岗位：${a.role}${a.city?'\n城市：'+a.city:''}${a.salary?'\n薪资：'+a.salary:''}\n岗位描述 / 备注：\n${(a.notes||'（没有填写）').slice(0,5000)}`;}
function resumeCtx(a){const r=resumeFor(a);return r?{title:r.title,text:r.text.replace(/\n{2,}/g,'\n').slice(0,6000)}:null;}
function weakCtx(){const R={};for(const a of db.apps){for(const r of a.fail?.reasons||[])R[r]=(R[r]||0)+1;for(const e of a.events)for(const r of e.weak||[])R[r]=(R[r]||0)+1;}
 for(const m of db.mocks)if(!m.aid)for(const r of m.report?.weak||[])R[r]=(R[r]||0)+1;
 return Object.entries(R).filter(([k])=>!['不清楚','没回音'].includes(k)).sort((x,y)=>y[1]-x[1]).slice(0,5).map(([k,n])=>`${k}（${n} 次）`).join('、');}

/* ---------- AI 模拟面试官 ---------- */
let MK=null;
const MK_KIND=['技术一面：基础 + 项目','技术二面：项目深挖 + 系统设计','HR 面：动机、稳定性、薪资','专练我的薄弱点'];
const MK_PERSONA=['标准面试官：专业、就事论事，按正常节奏问','压力面：连环追问，会打断，会直接质疑你的答案','严厉型：挑刺为主，指出每个漏洞，很少肯定','温和引导型：循循善诱，答不上来时会给提示','项目深挖型：只盯着项目细节刨根问底，不问八股'];
const MOCK_A={id:'',company:'AI 模拟面试',role:'',events:[]};
function openMock(aid){closeModal();const act=db.apps.filter(a=>!['rejected','dropped'].includes(a.status)).sort((x,y)=>y.updatedAt-x.updatedAt);
 MK=null;aiModal('🎙 AI 模拟面试',`<p class="t2" style="margin:0 0 12px">AI 扮演面试官：一次问一题，根据你的回答追问，最后打分并指出薄弱点。答得不好的题会进题库，薄弱点会算进复盘页的统计。</p>
 <div class="fg"><div class="f full"><label>针对哪个岗位（会读它的 JD 和你的简历）</label><select class="inp" id="mkApp"><option value="">通用练习（按我的目标岗位：${esc(aiTarget())}）</option>${act.map(a=>`<option value="${a.id}" ${a.id===aid?'selected':''}>${esc(a.company)} · ${esc(a.role)}</option>`).join('')}</select></div>
 <div class="f"><label>面试类型</label><select class="inp" id="mkKind">${MK_KIND.map((k,i)=>`<option value="${i}">${k}</option>`).join('')}</select></div>
 <div class="f"><label>面试官风格</label><select class="inp" id="mkPersona">${MK_PERSONA.map((k,i)=>`<option value="${i}">${k}</option>`).join('')}</select></div>
 <div class="f"><label>主问题数量（追问不算）</label><select class="inp" id="mkN">${[3,5,8].map(n=>`<option ${n===5?'selected':''}>${n}</option>`).join('')}</select></div></div>
 ${aiSlow()?'<p class="t2">现在用的是命令行工具，每轮要等 20～60 秒；DeepSeek 充值后会快很多。</p>':''}
 <div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="mkstart">开始面试</button></div>`,'mock');}
function mkSystem(){const a=MK.aid?appById(MK.aid):null,r=resumeCtx(a),w=weakCtx(),kind=MK_KIND[MK.kind];
 return `你是一位严格但友善的中文面试官，正在进行「${kind}」。${MK.persona?`你的面试风格是「${MK_PERSONA[MK.persona].split('：')[0]}」：${MK_PERSONA[MK.persona].split('：')[1]}，请全程保持这个风格。`:''}候选人应聘：${a?`${a.company} 的 ${a.role}`:aiTarget()}。
${a?'【岗位信息】\n'+appCtx(a)+'\n':''}${r?`【候选人简历（${r.title}）】\n${r.text}\n`:'（没有简历内容，就按岗位常见要求出题）\n'}${w?`【候选人以往的薄弱点】${w}\n`:''}
规则：
1. 一次只问一个问题。问题要具体，优先结合简历里的真实项目和岗位要求${MK.kind==3?'，重点考察上面列出的薄弱点':''}${MK.kind==2?'；HR 面问求职动机、离职原因、职业规划、优缺点、薪资期望、抗压等':''}。
2. 候选人回答后：回答不完整、有错误或有值得深挖的亮点时可以追问（同一主题最多追问 2 次），否则换下一个主题。
3. 主问题一共 ${MK.n} 个（追问不算），每条用户消息会告诉你已经问到第几个。
4. 每次只输出一个 JSON 对象：{"comment":"对上一个回答的点评，2～4 句，说清楚对在哪、错在哪、漏了什么（开场时为空字符串）","score":上一个回答的分数，1～5 的整数（开场时为 0）,"question":"下一个问题（主问题问满且不再追问时为空字符串）","followup":这个问题是否是追问 true/false,"topic":"这个问题考察的知识点，2～8 个字"}`;}
async function mkCall(userMsg){const tk=AIREQ;MK.busy=true;MK.msgs.push({role:'user',content:userMsg});renderMock();
 try{const j=await ai({system:mkSystem(),messages:MK.msgs,json:true,max:900,temperature:.6});if(!MK||tk!==AIREQ)return;
  MK.msgs.push({role:'assistant',content:JSON.stringify(j)});MK.busy=false;MK.err='';return j;}
 catch(e){if(!MK||tk!==AIREQ)return;MK.msgs.pop();MK.busy=false;MK.err=e.message;renderMock();return null;}}
async function mkStart(){const aid=document.getElementById('mkApp').value,kind=+document.getElementById('mkKind').value,persona=+document.getElementById('mkPersona').value,n=+document.getElementById('mkN').value;
 MK={aid,kind,persona,n,msgs:[],qa:[],cur:null,main:0,busy:false,err:'',last:''};
 const j=await mkCall('面试开始，请问第一个问题。（已问主问题 0/'+n+'）');if(!j)return;
 MK.cur={q:j.question||'请先做个简单的自我介绍。',topic:j.topic||'',follow:false};MK.main=1;renderMock();}
async function mkAnswer(skip){if(!MK||MK.busy||!MK.cur)return;const el=document.getElementById('mkA');const ans=skip?'（这题我不会，跳过）':(el?.value||'').trim();
 if(!ans){toast('先写下你的回答，或者点「跳过」');return;}mkStopVoice();MK.last=ans;
 const full=MK.main>=MK.n;const j=await mkCall(`我的回答：${ans}\n（已问主问题 ${MK.main}/${MK.n}${full?'，主问题已问满：只点评这个回答；最多再追问 1 次，不追问就把 question 设为空字符串':''}）`);
 if(!j)return;MK.qa.push({q:MK.cur.q,topic:MK.cur.topic,follow:MK.cur.follow,a:ans,score:Math.max(0,Math.min(5,+j.score||0)),comment:j.comment||''});MK.last='';
 const nq=String(j.question||'').trim(),follow=!!j.followup;
 if(!nq||(!follow&&MK.main>=MK.n)||MK.qa.length>=MK.n*3)return mkFinish();
 if(!follow)MK.main++;MK.cur={q:nq,topic:j.topic||'',follow};renderMock();}
async function mkFinish(){if(!MK)return;mkStopVoice();if(!MK.qa.length){closeModal();return;}MK.cur=null;MK.busy=true;MK.err='';renderMock();const tk=AIREQ;
 const a=MK.aid?appById(MK.aid):null,tx=MK.qa.map((x,i)=>`第 ${i+1} 题${x.follow?'（追问）':''}【${x.topic}】${x.q}\n回答：${x.a}\n面试官当场点评（${x.score}/5）：${x.comment}`).join('\n\n');
 try{const j=await ai({system:'你是资深面试评估官，根据面试记录给出客观、具体、可执行的评估。用中文。',prompt:`这是一场「${MK_KIND[MK.kind]}」的模拟面试，候选人应聘${a?a.company+' 的 '+a.role:aiTarget()}。\n\n${tx}\n\n只输出一个 JSON：{"score":0～100 的总分,"verdict":"建议通过"或"待定"或"不建议通过","summary":"2～3 句总体评价","strengths":["做得好的点"],"weak":["从这些标签里选最相关的 0～3 个：${WEAK_RS.join('、')}"],"advice":["3～5 条具体改进建议"],"better":[{"q":"答得不好的题","tip":"这题更好的回答思路，2～3 句"}]}`,json:true,max:1800,temperature:.3});
  if(!MK||tk!==AIREQ)return;MK.busy=false;MK.report=Object.assign({score:0,verdict:'',summary:'',strengths:[],weak:[],advice:[],better:[]},j);MK.report.weak=(MK.report.weak||[]).filter(w=>WEAK_RS.includes(w));mkSave();renderMock();skHit(innerWidth/2,innerHeight/2-80,MK.report.score>=75?'don':'pon',MK.report.score>=75);}
 catch(e){if(!MK||tk!==AIREQ)return;MK.busy=false;MK.err=e.message;renderMock();}}
function mkSave(){const R=MK.report,a=MK.aid?appById(MK.aid):null,m={id:uid(),at:nowLocal(),aid:MK.aid||'',kind:MK_KIND[MK.kind],persona:MK_PERSONA[MK.persona||0],qa:MK.qa,report:R};db.mocks.push(m);MK.saved=m.id;
 const badQ=MK.qa.filter(x=>x.score&&x.score<=3).map(x=>x.q.replace(/\s*\n\s*/g,' '));
 if(a){a.events.push({id:uid(),type:'note',title:'AI 模拟面试 · '+MK_KIND[MK.kind].split('：')[0]+(MK.persona?' · '+MK_PERSONA[MK.persona].split('：')[0]:''),at:'',done:true,rating:Math.max(1,Math.round((+R.score||0)/20)),questions:badQ.join('\n'),review:[R.summary,...(R.advice||[]).map(x=>'· '+x)].filter(Boolean).join('\n'),weak:R.weak,place:'',mock:m.id});touch(a);}
 else{m.badQ=badQ;persist();}}
function mkReportHtml(R,qa){return `<div class="mkrep"><div class="mkscore"><b>${+R.score||0}</b><span>/ 100</span><em>${esc(R.verdict||'')}</em></div><p>${fmtAI(R.summary||'')}</p>
 ${R.strengths?.length?`<h4 class="mdh">做得好的</h4><ul>${R.strengths.map(x=>`<li>${fmtAI(x)}</li>`).join('')}</ul>`:''}
 ${R.advice?.length?`<h4 class="mdh">怎么改进</h4><ul>${R.advice.map(x=>`<li>${fmtAI(x)}</li>`).join('')}</ul>`:''}
 ${R.better?.length?`<h4 class="mdh">这几题可以这样答</h4>${R.better.map(x=>`<div class="mkbetter"><div class="t1">${fmtAI(x.q)}</div><div class="t2">${fmtAI(x.tip)}</div></div>`).join('')}`:''}
 ${R.weak?.length?`<div class="quick" style="margin-top:10px">${R.weak.map(w=>`<span class="tag">薄弱点 · ${esc(w)}</span>`).join('')}</div>`:''}
 <details class="mklog"><summary>查看完整问答（${qa.length} 题）</summary>${qa.map(x=>`<div class="mkqa"><div class="t1">${x.follow?'↳ 追问：':''}${fmtAI(x.q)}</div><div class="mkans">${esc(x.a)}</div><div class="t2">${'★'.repeat(x.score)}${'☆'.repeat(5-x.score)} ${fmtAI(x.comment)}</div></div>`).join('')}</details></div>`;}
function renderMock(){if(!MK)return;const b=document.getElementById('aiBody');if(!b)return;const a=MK.aid?appById(MK.aid):null;
 const head=`<div class="mkhead"><span class="tag">${esc(a?a.company:'通用练习')}</span><span class="tag">${esc(MK_KIND[MK.kind].split('：')[0])}</span>${MK.persona?`<span class="tag">${esc(MK_PERSONA[MK.persona].split('：')[0])}</span>`:''}${MK.cur||MK.busy&&!MK.report?`<span class="t2">第 ${Math.max(1,MK.main)} / ${MK.n} 题</span>`:''}</div>`;
 const last=MK.qa.at(-1);
 if(MK.report){b.innerHTML=head+mkReportHtml(MK.report,MK.qa)+aiWho()+`<div class="mfoot"><button class="btn" data-act="mkagain">再练一次</button><button class="btn primary" data-act="mclose">完成</button></div>`;return;}
 if(!MK.cur&&!MK.qa.length&&MK.err){b.innerHTML=head+aiErr({message:MK.err},'mkretrystart');return;}
 if(!MK.cur){b.innerHTML=head+(MK.err?aiErr({message:MK.err},'mkfinish'):aiLoading(MK.qa.length?'面试结束，正在生成评估报告…':'面试官正在看你的简历和 JD，准备第一个问题…'));return;}
 b.innerHTML=head+(last?`<div class="mklast"><div class="t2">上一题点评 · ${'★'.repeat(last.score)}${'☆'.repeat(5-last.score)}</div><div>${fmtAI(last.comment)}</div></div>`:'')+
  `<div class="mkq">${MK.cur.follow?'<span class="t2">追问 ↳</span> ':''}${fmtAI(MK.cur.q)}</div>`+
  (MK.busy?aiLoading('面试官在看你的回答…'):`${MK.err?`<div class="alert" style="margin-bottom:8px">😵 ${esc(MK.err)}（回答还在，可以再点「提交」）</div>`:''}<textarea class="inp" id="mkA" rows="6" placeholder="像面试时口头回答那样写下来，Ctrl + Enter 提交">${esc(MK.last)}</textarea>
  <div class="mfoot"><button class="btn ghost" data-act="mkend" style="margin-right:auto">结束并评分</button>${SR?`<button class="btn" data-act="mkvoice" id="mkVoice">🎤 语音作答</button>`:''}<button class="btn" data-act="mkskip">跳过</button><button class="btn primary" data-act="mkans">提交回答</button></div>`);
 if(!MK.busy)setTimeout(()=>{const t=document.getElementById('mkA');if(t){t.focus();t.selectionStart=t.value.length;}},30);}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let mkRec=null;
function mkVoice(){if(!SR)return;if(mkRec){mkStopVoice();return;}const t=document.getElementById('mkA'),base=t.value;mkRec=new SR();mkRec.lang='zh-CN';mkRec.continuous=true;mkRec.interimResults=true;
 mkRec.onresult=e=>{let s='';for(const r of e.results)s+=r[0].transcript;const x=document.getElementById('mkA');if(x){x.value=(base?base+'\n':'')+s;if(MK)MK.last=x.value;}};
 mkRec.onerror=e=>{toast(e.error==='not-allowed'?'没有麦克风权限':'语音识别出错：'+e.error);mkStopVoice();};mkRec.onend=()=>{mkRec=null;const v=document.getElementById('mkVoice');if(v)v.textContent='🎤 语音作答';};
 try{mkRec.start();document.getElementById('mkVoice').textContent='⏹ 停止录音';}catch{mkRec=null;}}
function mkStopVoice(){if(mkRec){try{mkRec.stop();}catch{}mkRec=null;}}
function openMockReport(id){const m=db.mocks.find(x=>x.id===id);if(!m)return;closeModal();aiModal(`🎙 模拟面试 · ${esc(m.kind.split('：')[0])}`,`<div class="t2" style="margin-bottom:8px">${esc(m.at.replace('T',' '))}${m.aid&&appById(m.aid)?' · '+esc(appById(m.aid).company):' · 通用练习'}</div>`+mkReportHtml(m.report||{},m.qa||[])+`<div class="mfoot"><button class="btn danger ghost" data-act="mkdel" data-id="${m.id}" style="margin-right:auto">删除</button><button class="btn primary" data-act="mclose">好的</button></div>`,'mock');}
function mockCard(){const L=db.mocks.slice().sort((x,y)=>y.at.localeCompare(x.at)).slice(0,5);
 return `<div class="card sec mockcard"><h3>🎙 AI 模拟面试<span class="m">AI 当面试官，问答、追问、打分</span></h3><div class="mkrow"><div style="flex:1;min-width:0">${L.length?L.map(m=>`<a href="#" class="mkitem" data-act="mkview" data-id="${m.id}"><b>${+m.report?.score||0}</b><span>${esc(m.aid&&appById(m.aid)?appById(m.aid).company:'通用练习')} · ${esc(m.kind.split('：')[0])}</span><span class="t2">${esc(m.at.slice(5,10))}</span></a>`).join(''):'<span class="t2">还没练过。选一个投递的岗位，AI 会结合它的 JD 和你的简历出题。</span>'}</div><button class="btn primary" data-act="mock">开始模拟面试</button></div></div>`;}

/* ---------- 粘贴面试邀请 → 建日程 ---------- */
let INV=null;
const looksInvite=t=>/面试|笔试|测评|宣讲|offer|邀请|视频面|[一二三四终复初]面|技术面|hr ?面|主管面|面一下|腾讯会议|飞书会议|会议号|zoom/i.test(t)&&/(\d{1,2}\s*[:：点]|\d{1,2}\s*月\s*\d{1,2}|\d{1,2}[/-]\d{1,2}|明天|后天|今天|下周|周[一二三四五六日天]|星期)/.test(t)&&t.length<4000;
function openInvite(text='',aid=''){closeModal();INV={aid,text,res:null};aiModal('📋 粘贴面试邀请',`<p class="t2" style="margin:0 0 8px">把 HR 发来的消息（微信、短信、邮件都行）整段粘进来，AI 会认出公司、时间、轮次和会议链接，帮你建好日程。</p><textarea class="inp" id="invT" rows="7" placeholder="如：您好，邀请您参加我司 Java 开发工程师岗位的二面，时间 11 月 28 日（周五）下午 2:30，腾讯会议 123-456-789……">${esc(text)}</textarea><div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="invgo">识别</button></div>`);
 setTimeout(()=>document.getElementById('invT')?.focus(),30);}
function invMatch(c){c=String(c||'').trim().toLowerCase();if(!c)return null;return db.apps.filter(a=>!['rejected','dropped'].includes(a.status)).find(a=>{const x=a.company.trim().toLowerCase();return x&&(x===c||x.includes(c)||c.includes(x));})||null;}
async function invGo(){const el=document.getElementById('invT'),t=(el?el.value:INV.text||'').trim();if(!t){toast('先粘贴邀请内容');return;}INV.text=t;const d=new Date(),tk=AIREQ;
 document.getElementById('aiBody').innerHTML=aiLoading('正在识别邀请内容…');
 try{const j=await ai({system:'你从招聘方发来的消息里提取面试或笔试安排。只依据原文，没有的信息留空字符串，不要编造。',prompt:`今天是 ${today()}（星期${WK[d.getDay()]}），现在 ${nowLocal().slice(11)}。相对日期（明天、下周三等）按今天换算。\n消息原文：\n${t}\n\n只输出 JSON：{"company":"公司名","role":"岗位","type":"interview 或 test（笔试、测评、机考、OA 算 test）","title":"轮次，如 一面 / 二面 / HR 面 / 笔试","at":"YYYY-MM-DDTHH:mm，24 小时制，没写具体时间就留空","place":"会议链接、会议号或地址，原样保留","contact":"联系人和联系方式","notes":"其他要注意的事（要准备的材料、时长、着装等），一两句"}`,json:true,max:600,temperature:0});
  if(!aiLive(tk))return;INV.res=j;renderInvite();}
 catch(e){if(aiLive(tk))document.getElementById('aiBody').innerHTML=aiErr(e,'invgo2');}}
function renderInvite(){const j=INV.res,m=INV.aid?appById(INV.aid):invMatch(j.company),at=/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(j.at||'')?j.at:'';
 const near=at?allEvents().filter(({e})=>e.at&&!e.done&&Math.abs(new Date(e.at)-new Date(at))<90*6e4):[];
 document.getElementById('aiBody').innerHTML=`${near.length?`<div class="alert" style="margin-bottom:10px">⚠️ 时间和这些安排挨得很近：${near.map(({a,e})=>`${esc(a.company)} ${esc(e.title||EV[e.type])}（${e.at.slice(5).replace('T',' ')}）`).join('、')}</div>`:''}
 <div class="fg"><div class="f full"><label>记到哪个投递</label><select class="inp" id="invApp"><option value="">新建投递：${esc(j.company||'未识别公司')}${j.role?' · '+esc(j.role):''}</option>${db.apps.filter(a=>!['rejected','dropped'].includes(a.status)).map(a=>`<option value="${a.id}" ${m&&m.id===a.id?'selected':''}>${esc(a.company)} · ${esc(a.role)}</option>`).join('')}</select></div>
 <div class="f"><label>类型</label><select class="inp" id="invType"><option value="interview" ${j.type!=='test'?'selected':''}>面试</option><option value="test" ${j.type==='test'?'selected':''}>笔试 / 测评</option></select></div>
 <div class="f"><label>轮次</label><input class="inp" id="invTitle" value="${esc(j.title||'')}"></div>
 <div class="f"><label>时间${at?'':' <span style="color:var(--bad)">（没认出具体时间，请填上）</span>'}</label><input class="inp" type="datetime-local" id="invAt" value="${esc(at)}"></div>
 <div class="f"><label>地点 / 会议</label><input class="inp" id="invPlace" value="${esc(j.place||'')}"></div>
 <div class="f full"><label>备注</label><input class="inp" id="invNotes" value="${esc([String(j.notes||'').replace(/[。；;，,\s]+$/,''),j.contact&&('联系人：'+j.contact)].filter(Boolean).join('；'))}"></div></div>${aiWho()}
 <div class="mfoot"><button class="btn" data-act="invback" style="margin-right:auto">改原文</button><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="invsave">建日程</button></div>`;}
function invSave(){const g=id=>document.getElementById(id)?.value.trim()||'',j=INV.res;if(!g('invAt')){toast('请填上时间');return;}
 let a=appById(g('invApp'));if(!a){a=newApp({company:j.company||'未命名公司',role:j.role||'',status:'applied',notes:''});db.apps.push(a);}
 const tp=g('invType');a.events.push({id:uid(),type:tp,title:g('invTitle'),at:g('invAt'),place:g('invPlace'),done:false,rating:0,questions:'',review:''});
 if(g('invNotes'))a.notes=(a.notes?a.notes+'\n':'')+`【${g('invTitle')||EV[tp]}】${g('invNotes')}`;
 if(tp==='interview'&&['applied','test','wish'].includes(a.status))setStatus(a,'interview');else if(tp==='test'&&['applied','wish'].includes(a.status))setStatus(a,'test');
 touch(a);closeModal();render();skHit(innerWidth/2,innerHeight/2-60,'pon');toast(`已建好：${a.company} ${g('invTitle')||EV[tp]} · ${g('invAt').replace('T',' ')}`,['查看',()=>openDrawer(a.id)]);}

/* ---------- 按 JD 改简历建议 ---------- */
let JDA='';
async function openJdAdvice(aid,force){const a=appById(aid);if(!a)return;closeModal();JDA=aid;
 const r=resumeCtx(a);if(!r)return toast('如页里还没有简历，先去「我的简历」写一份');if(!(a.notes||'').trim())return toast('先在备注里粘贴这个岗位的 JD');
 const tk=aiModal(`✨ ${esc(a.company)} · 按 JD 看简历`,'');
 if(a.aiResume&&!force)return jdShow(a);
 document.getElementById('aiBody').innerHTML=aiLoading(`正在对比「${r.title}」和岗位要求…`);
 try{const t=await ai({system:'你是资深技术招聘官兼简历顾问，熟悉国内互联网公司的招聘。建议要具体到句子，只基于简历里真实存在的经历，绝不编造经历或数据；需要补数据的地方用【补充：…】提示候选人自己填。用中文 Markdown。',
  prompt:`${appCtx(a)}\n\n【候选人简历：${r.title}】\n${r.text}\n\n请输出：\n## 匹配度\n0～100 分，一句话说明最大的优势和差距。\n## 岗位要求对照\n逐条列出 JD 的关键要求，每条标 ✓ 简历里有 / △ 有但不突出 / ✗ 没有。\n## 逐句修改建议\n至少 5 条，格式：原句 → 改写后，并说明为什么。\n## 建议补充或突出的关键词\n## 面试官看了这份简历可能追问的问题\n5 条。`,max:3000,temperature:.4});
  a.aiResume={at:nowLocal(),title:r.title,text:t,engine:AIL.engine};touch(a);if(aiLive(tk))jdShow(a);else toast(`${a.company} 的简历建议好了`,['查看',()=>openJdAdvice(a.id)]);}
 catch(e){if(aiLive(tk))document.getElementById('aiBody').innerHTML=aiErr(e,'jdadvice2');}}
function jdShow(a){const x=a.aiResume;document.getElementById('aiBody').innerHTML=`<div class="t2" style="margin-bottom:6px">对照简历「${esc(x.title)}」· ${esc(x.at.replace('T',' '))} · 由 ${AI_NAME[x.engine]||'AI'} 生成</div><div class="aiout">${md(x.text)}</div>
 <div class="mfoot"><button class="btn" data-act="jdadvice2" style="margin-right:auto">重新生成</button><button class="btn" data-act="aicopy">📋 复制</button><button class="btn primary" data-view="resume">去改简历</button></div>`;INV={copy:x.text,aid:a.id};}

/* ---------- 题目参考答案 ---------- */
async function aiAnswer(h,btn){const x=allQuestions().find(q=>q.h===h);if(!x)return;const inFC=!!FC;if(btn){btn.setAttribute('disabled','');btn.textContent='生成中…';}
 try{const t=await ai({system:'你是资深后端面试官，给出适合面试时口头回答的参考答案。中文，简洁准确。',prompt:`面试题：${x.q}\n应聘岗位：${aiTarget(x.a.role?x.a:null)}\n\n格式：第一行一句话结论；然后 3～6 个要点，每点一行，以「· 」开头，原理题给出关键细节；最后一行以「可能追问：」开头列 1～2 个追问。总共不超过 300 字，不要用 Markdown 标题。`,max:800,temperature:.3});
  const old=db.qnote[h]||'';db.qnote[h]=old?old+'\n\n——AI 参考——\n'+t:t;persist();
  const ta=document.querySelector(`[data-qnote="${h}"]`);if(ta)ta.value=db.qnote[h];
  if(!inFC){closeModal();aiModal('✨ 参考答案',`<div class="t1" style="margin-bottom:8px">${esc(x.q)}</div><div class="aiout">${md(t)}</div>${aiWho()}<p class="t2">已写进这道题的「我的答案要点」，抽卡复习翻面时能看到。</p><div class="mfoot"><button class="btn primary" data-act="mclose">好的</button></div>`);render();}
  else toast('参考答案已写进答案要点');}
 catch(e){toast('😵 '+e.message);}finally{if(btn&&btn.isConnected){btn.removeAttribute('disabled');btn.textContent='✨ AI 参考答案';}}}

/* ---------- AI 写话术 ---------- */
const MSG_KIND=['询问面试结果 / 进度','面试后的感谢信','投递后跟进（还没回音）','谈薪：争取更好的 Offer','婉拒 Offer','接受 Offer，确认入职细节','请内推人帮忙','其他（在下面说明）'];
function openAiMsg(aid){const a=appById(aid);if(!a)return;closeModal();aiModal(`✨ 给 ${esc(a.company)} 写一条消息`,`<div class="fg"><div class="f"><label>要写什么</label><select class="inp" id="msgK">${MSG_KIND.map(k=>`<option>${k}</option>`).join('')}</select></div>
 <div class="f"><label>发在哪</label><select class="inp" id="msgC"><option>微信 / Boss 聊天（简短口语）</option><option>邮件（正式）</option></select></div>
 <div class="f full"><label>补充说明（可不填）</label><textarea class="inp" id="msgX" rows="3" placeholder="如：期望薪资 25K，对方给了 22K；或者：面试官姓王，聊得最多的是消息队列"></textarea></div></div>
 <div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="msggo" data-a="${a.id}">生成</button></div>`);}
async function msgGo(aid){const a=appById(aid),k=document.getElementById('msgK').value,c=document.getElementById('msgC').value,x=document.getElementById('msgX').value.trim(),tk=AIREQ,P=db.settings.profile||{};
 const now=nowLocal(),evs=a.events.filter(e=>e.type!=='note').map(e=>`${e.at?e.at.replace('T',' '):'时间未定'} ${e.title||EV[e.type]}${e.at&&e.at>now?'（还没进行）':e.done||e.at?'（已进行）':''}${e.review?'，复盘：'+e.review.slice(0,120):''}`).join('\n');
 const others=db.apps.filter(o=>o.id!==a.id&&o.status==='offer'&&annual(o.offer)).map(o=>`${o.company} 年包约 ${fmtK(annual(o.offer))}`).join('；');
 document.getElementById('aiBody').innerHTML=aiLoading('正在写…');
 try{const t=await ai({system:'你帮求职者写发给招聘方的消息：真诚、得体、不卑不亢，不夸大不编造。只输出消息正文本身，不要解释。',prompt:`今天是 ${today()}，现在 ${nowLocal().slice(11)}。\n要写：${k}\n发送渠道：${c}\n我的名字：${P.name||'（不写名字）'}\n${appCtx(a).slice(0,1500)}\n当前进度：${SM[a.status].n}${a.appliedAt?'，投递于 '+a.appliedAt:''}\n联系人：${a.contact||'HR'}\n面试经过：\n${evs||'（无）'}\n${a.status==='offer'?`这家的 Offer：${JSON.stringify(a.offer)}\n`:''}${others?`我手上其他 Offer：${others}\n`:''}${x?'补充说明：'+x:''}\n\n${/微信/.test(c)?'控制在 120 字以内，口语一点，不要称呼「尊敬的」。':'带主题行，200～300 字。'}`,max:700,temperature:.7});
  if(!aiLive(tk))return;INV={copy:t};document.getElementById('aiBody').innerHTML=`<textarea class="inp" id="msgOut" rows="9">${esc(t)}</textarea>${aiWho()}<div class="mfoot"><button class="btn" data-act="msggo" data-a="${a.id}" style="margin-right:auto">换一版</button><button class="btn primary" data-act="aicopy">📋 复制</button></div>`;}
 catch(e){if(aiLive(tk))document.getElementById('aiBody').innerHTML=aiErr(e);}}

/* ---------- 周 / 月复盘总结 ---------- */
let AIRV=null;
async function aiReview(){const R=pRange(rvU,rvO),c=pStats(R),lab=rvLab(),k=rvU+':'+R[0],tk=aiModal(`✨ AI 总结${lab}`,aiLoading(`正在整理${lab}的投递、面试和日记…`));
 const inR=d=>!!d&&d>=R[0]&&d<=R[1],J=db.journal.filter(x=>inR(x.date)&&(x.text||'').trim()).map(x=>`${x.date}${x.mood?' 心情'+x.mood+'/5':''}：${x.text.slice(0,300)}`).join('\n');
 const ivs=allEvents().filter(({e})=>(e.type==='interview'||e.type==='test')&&inR((e.at||'').slice(0,10))).map(({a,e})=>`${e.at.slice(0,10)} ${a.company} ${e.title||EV[e.type]}${e.at>nowLocal()?'（还没进行）':''}${e.rating?' 自评'+e.rating+'/5':''}${e.weak?.length?' 薄弱：'+e.weak.join('、'):''}${e.review?' 复盘：'+e.review.slice(0,150):''}`).join('\n');
 const fails=db.apps.filter(a=>a.status==='rejected'&&a.fail&&inR(a.fail.at)).map(a=>`${a.company} 卡在${a.fail.stage}${a.fail.reasons?.length?'（'+a.fail.reasons.join('、')+'）':''}`).join('；');
 const mocks=db.mocks.filter(m=>inR(m.at.slice(0,10))).map(m=>`${m.kind.split('：')[0]} ${m.report?.score||0} 分`).join('；');
 try{const j=await ai({system:'你是求职教练，根据求职者这段时间的真实记录写复盘。具体、有依据、语气鼓励但不空泛。中文。',prompt:`今天是 ${today()}。时间段：${lab}（${R[0]} ~ ${R[1]}）\n投递 ${c.apps} 个，面试 ${c.iv} 场，拿到 Offer：${c.offers.join('、')||'无'}\n记录日记 ${c.days} 天，学习 ${c.hours} 小时，专注 ${c.focus} 分钟${c.mood?'，平均心情 '+c.mood.toFixed(1)+'/5':''}\n本周投递目标：${db.settings.weekGoal||'未设'} 个\n面试：\n${ivs||'无'}\n未通过：${fails||'无'}\n模拟面试：${mocks||'无'}\n日记：\n${J||'无'}\n\n只输出 JSON：{"summary":"一句话总结这段时间","good":"做得好的，2～4 条，每条一行，以「· 」开头","bad":"需要改进的，2～4 条，同样格式","next":"下阶段计划，3～5 条可执行的具体行动，同样格式"}`,json:true,max:1200,temperature:.5});
  if(!aiLive(tk))return;AIRV={k,j};document.getElementById('aiBody').innerHTML=`<p class="t1">${esc(j.summary||'')}</p>${[['good','做得好的 👍'],['bad','需要改进的 🔧'],['next','下阶段计划 🎯']].map(([f,n])=>`<h4 class="mdh">${n}</h4><div class="aiout">${md(j[f]||'')}</div>`).join('')}${aiWho()}
  <div class="mfoot"><button class="btn" data-act="mclose" style="margin-right:auto">不用了</button><button class="btn primary" data-act="airvfill">填进${lab}复盘</button></div>`;}
 catch(e){if(aiLive(tk))document.getElementById('aiBody').innerHTML=aiErr(e);}}
function aiRvFill(){if(!AIRV)return;const r=db.reviews[AIRV.k]=db.reviews[AIRV.k]||{};for(const f of ['good','bad','next']){const v=String(AIRV.j[f]||'').trim();if(v)r[f]=r[f]?r[f]+'\n'+v:v;}persist();closeModal();render();toast('已填进复盘，可以再自己改改');}

/* ---------- 公司速查（联网搜索） ---------- */
const INTEL_RUN=new Set();
async function intel(aid){const a=appById(aid);if(!a||!a.company)return toast('先填公司名');if(INTEL_RUN.has(aid))return toast('正在查，好了会提醒你');
 INTEL_RUN.add(aid);if(openId===aid)renderDrawer();toast(`正在联网查 ${a.company}，一般要 1～3 分钟，好了会提醒你`,null,5000);
 try{const t=await ai({web:true,system:'你是求职调研助手。必须先用网络搜索查证，只写查得到的事实，查不到就写「没查到」，绝不编造。中文 Markdown。',prompt:`查一下这家公司，帮候选人判断值不值得去、面试怎么准备。\n公司：${a.company}\n岗位：${a.role}${a.city?'\n城市：'+a.city:''}\n\n按这个结构输出：\n## 一句话概况\n## 业务与规模\n主营业务、人数规模、融资或上市情况。\n## 近期动态\n近 6 个月的重要新闻，每条标日期。\n## 员工评价与工作强度\n加班、氛围、裁员传闻等，说明是哪类来源的说法。\n## 这个岗位的面经\n面试流程、轮数、常被问的技术点。\n## 风险提示\n## 来源\n列出参考链接。`,max:4000});
  a.intel={at:nowLocal(),text:t,engine:AIL.engine};touch(a);toast(`${a.company} 的速查好了`,['查看',()=>{openDrawer(a.id);setTimeout(()=>document.getElementById('intelSec')?.scrollIntoView({behavior:'smooth'}),200);}]);}
 catch(e){toast('😵 速查失败：'+e.message,null,8000);}finally{INTEL_RUN.delete(aid);if(openId===aid)renderDrawer();}}
function intelHtml(a){const run=INTEL_RUN.has(a.id);if(!a.intel&&!run)return '';
 return `<div class="dsec" id="intelSec"><h4>🔎 公司速查<span class="sp"></span>${run?'<span class="t2">正在联网查…</span>':`<span class="t2">${esc(a.intel.at.slice(0,10))}</span><button class="btn sm ghost" data-act="intel" data-a="${a.id}">重新查</button>`}</h4>${a.intel?`<details class="intel"><summary>${esc((a.intel.text.match(/一句话概况\s*\n+([^\n#]+)/)||[])[1]||'展开查看')}</summary><div class="aiout">${md(a.intel.text)}</div></details>`:''}</div>`;}

/* ---------- 设置里的 AI 状态 ---------- */
async function aiStatusFill(){const el=document.getElementById('aiStat');if(!el||!TOKEN)return;
 try{const r=await fetch(AI_URL+'/status',{headers:{'x-token':TOKEN},cache:'no-store'});const s=await r.json();const ks=document.getElementById('dsKeyStat');if(ks)ks.textContent=s.deepseek?.src==='env'?'✓ 已通过系统环境变量设置':s.deepseek?.src==='file'?'✓ 已保存在这台电脑上（不会被分享出去）':'没填的话 DeepSeek 用不了，会自动换用其他 AI';
  el.innerHTML=Object.entries(AI_NAME).map(([k,n])=>`<span class="tag">${s[k]?.ok&&!s[k].why?'✓':s[k]?.ok?'△':'✗'} ${n}${s[k]?.why?' · '+esc(s[k].why):''}</span>`).join(' ');}catch{el.textContent='连不上本机小助手';}}
async function aiTest(){const el=document.getElementById('aiStat');if(el)el.innerHTML='<span class="t2">测试中…</span>';
 try{const t=await ai({prompt:'只回复四个字：连接正常',max:20,temperature:0});toast(`✓ ${AI_NAME[AIL.engine]} 可用：${t.slice(0,20)}${AIL.skipped.length?'（'+AIL.skipped.join('，')+'）':''}`,null,6000);}catch(e){toast('😵 '+e.message,null,8000);}aiStatusFill();}
const mkLock=()=>!!(MK&&!MK.report&&(MK.cur||MK.qa.length));

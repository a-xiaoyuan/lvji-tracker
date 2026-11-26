// 履迹 · Agent 额度（可选功能）
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== Agent 额度 ========== */
const AG={d:null,err:'',at:0,busy:false};
const FAM_C={Opus:'#ff2d87',Sonnet:'#5f5a63',Haiku:'#959ba6',Fable:'#2b2930','其他':'#c9ced6'};
function fmtTok(n){n=+n||0;return n>=1e8?(n/1e8).toFixed(n>=1e9?0:1)+' 亿':n>=1e4?(n/1e4).toFixed(n>=1e6?0:1)+' 万':String(n);}
function fmtLeft(ms){if(ms<=0)return '已重置';const m=Math.round(ms/6e4),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;return d?`${d} 天 ${h} 小时`:h?`${h} 小时 ${mm} 分`:`${mm} 分钟`;}
function hm(t){const d=new Date(t);return `${pad(d.getHours())}:${pad(d.getMinutes())}`;}
async function loadAgent(force){if(!TOKEN||AG.busy)return;if(!force&&Date.now()-AG.at<30000)return;AG.busy=true;
 try{const r=await fetch('http://127.0.0.1:47321/api/agent',{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)throw new Error(r.status===404?'本机助手版本旧了，重新打开履迹试试':'HTTP '+r.status);AG.d=await r.json();AG.err='';}
 catch(e){AG.err=String(e.message||e);}AG.at=Date.now();AG.busy=false;agentAfterLoad();}
function agSnoozed(){try{return JSON.parse(localStorage.getItem('jt_agsnooze')||'{}');}catch{return {};}}
const agShow=()=>!!(AG.d&&!AG.d.off); // Agent 额度是可选功能，没打开时不显示这一页，也不提醒
async function agentToggle(on){try{const r=await fetch('http://127.0.0.1:47321/api/agent/enable',{method:'POST',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify({on})});if(!r.ok)throw 0;AG.d=null;AG.at=0;await loadAgent(true);toast(on?'已打开 Agent 额度，左边菜单「工具」下面能看到':'已关闭 Agent 额度，不再读取其他 AI 工具的记录');render();}catch{toast('没切换成功：本机助手没连上');}}
function agentAlerts(D,now){if(!D||D.off)return [];const L=[],S=agSnoozed(),X=D.others||{};
 const add=(k,tool,msg,lv)=>{if(!(S[k]>now))L.push({k,tool,msg,lv});};
 const q=(k,tool,name,pct,reset,win)=>{if(!(reset>now)||!(pct>=0))return;const p=pace(pct,reset,win,now),r=Math.round(pct);
  if(pct>=80||(p&&p.out&&pct>=40))add(`${k}-${Math.round(reset/6e4)}`,tool,`${tool} ${name}额度已用 ${r}%${p&&p.out?`，按目前速度约 ${fmtLeft(p.out)}后用完`:''}，${fmtLeft(reset-now)}后重置`,pct>=95||(p&&p.out)?'bad':'warn');};
 const O=D.official;if(O){if(O.five_hour)q('cc5','Claude Code','5 小时',O.five_hour.used_percentage,O.five_hour.resets_at*1000,5*3600e3);if(O.seven_day)q('cc7','Claude Code','每周',O.seven_day.used_percentage,O.seven_day.resets_at*1000,7*864e5);}
 const rl=X.codex?.rl;if(rl)for(const [x,n] of [[rl.primary,'cx1'],[rl.secondary,'cx2']])if(x)q(n,'Codex',winName(x.window_minutes),x.used_percent,x.resets_at*1000,(+x.window_minutes||0)*6e4);
 const g=X.grok;if(g&&!g.none&&!g.error){if(g.blocked&&g.resetAt>now)add(`grok-block-${Math.round(g.resetAt/6e4)}`,'Grok Bot',`Grok Bot 本周额度已用完，${fmtLeft(g.resetAt-now)}后重置`,'bad');else q('grok','Grok Bot','每周',g.pct,g.resetAt,7*864e5);}
 const d=X.dsh;if(d&&!d.error&&d.balance!==null&&d.balance<1)add('dsh-low','dsh',d.balance<=0?`dsh 余额已用完（${money(d.balance,d.currency)}），需要充值才能继续用`:`dsh 余额只剩 ${money(d.balance,d.currency)}`,d.balance<=0?'bad':'warn');
 return L;}
function agentAfterLoad(){const free=!openId&&!document.getElementById('modal').classList.contains('on');const now=Date.now(),L=agentAlerts(AG.d,now),sig=L.map(x=>x.k).join('|'),changed=sig!==AG.sig;AG.sig=sig;
 if(L.length&&db.settings.notify&&typeof Notification!=='undefined'&&Notification.permission==='granted'){let seen={};try{seen=JSON.parse(localStorage.getItem('jt_agseen')||'{}');}catch{}
  for(const a of L)if(!seen[a.k]){seen[a.k]=now;try{const n=new Notification('AI 额度提醒',{body:a.msg,tag:a.k});n.onclick=()=>{window.focus();view='agent';render();};}catch{}}
  for(const k in seen)if(now-seen[k]>14*864e5)delete seen[k];localStorage.setItem('jt_agseen',JSON.stringify(seen));}
 if(free&&(view==='agent'||changed))render();}
if(TOKEN){setInterval(()=>fetch('http://127.0.0.1:47321/api/ping',{headers:{'x-token':TOKEN},cache:'no-store'}).catch(()=>{}),60e3);}
if(TOKEN){setTimeout(()=>loadAgent(true),4000);setInterval(()=>{if(!document.hidden&&view!=='agent')loadAgent(true);},5*60e3);}
setInterval(()=>{if(view==='agent'&&!document.hidden)loadAgent(true);},60000);
setTimeout(()=>lcSync(false,true),2500);setInterval(()=>{if(!document.hidden)lcSync(false,true);},30*60e3);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&db.settings.lcUser&&(!db.lc||Date.now()-db.lc.at>10*60e3))lcSync(false,true);});
// 按窗口里已经过去的时间算用量速度，预测到重置时会用到多少、什么时候用完
function pace(pct,resetMs,winMs,now){const left=resetMs-now,el=winMs-left;if(!winMs||left<=0||el<winMs*.1||!(pct>0))return null;const rate=pct/el,proj=pct+rate*left;return {proj:Math.round(proj),out:proj>100?(100-pct)/rate:null};}
function gauge(title,x,now,winMs){if(!x)return `<div class="card ag-g empty-g"><div class="t2">${title}</div><div class="t2" style="margin-top:8px">暂无数据</div></div>`;
 const reset=x.resets_at*1000,expired=reset<=now,p=expired?0:Math.round(x.used_percentage),c=p>=85?'var(--bad)':p>=60?'var(--warn)':'var(--ok)';
 return `<div class="card ag-g"><div class="ring3" style="--p:${p};--c:${c}"><span><b>${p}</b>%</span></div><div><div class="t1">${title}</div><div class="t2">${expired?'已经过了重置时间，额度已恢复':`剩余 ${100-p}% · ${fmtLeft(reset-now)}后重置`}</div><div class="t2">重置时间 ${new Date(reset).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>${(()=>{const q=expired?null:pace(x.used_percentage,reset,winMs,now);return q?`<div class="t2 pace ${q.out?'bad':q.proj>=80?'warn':''}">📈 按目前速度，重置前约用到 ${Math.min(q.proj,999)}%${q.out?`，<b>约 ${fmtLeft(q.out)}后用完</b>`:''}</div>`:'';})()}</div></div>`;}
const AG_C={cc:'#ff2d87',codex:'#4b4852',dsh:'#5f5a63',wb:'#787e8a',grok:'#959ba6',kimi:'#b0b6c0',qoder:'#6b7079',gemini:'#868c97',trae:'#c9ced6'};
function winName(m){m=+m||0;return m<=300?'5 小时':m===10080?'每周':m>=43200?(Math.round(m/1440))+' 天':m%1440===0?(m/1440)+' 天':Math.round(m/60)+' 小时';}
function money(v,c){v=+v||0;return (v<0?'-':'')+(c==='USD'?'$':'¥')+Math.abs(v).toFixed(2);}
function miniBars(days,val,tip,color){const mx=Math.max(1e-9,...days.map(val));return `<div class="ag-days" style="height:120px">${days.map(d=>`<div title="${d.d}：${tip(d)}"><div class="st" style="height:${val(d)/mx*100}%;background:${color}"></div><span>${+d.d.slice(8)}</span></div>`).join('')}</div>`;}
function ago(t,now){const m=Math.round((now-t)/6e4);return m<1?'刚刚':m<60?m+' 分钟前':m<1440?Math.round(m/60)+' 小时前':Math.round(m/1440)+' 天前';}
function agOverview(D,now){const O=D.official,X=D.others||{},c=X.codex,ds=X.dsh,w=X.workbuddy;
 const card=(k,name,big,sub,warn)=>`<div class="card ag-ov" data-act="agjump" data-k="${k}" style="--c:${AG_C[k]}"><div class="t2"><span class="dot" style="background:${AG_C[k]}"></span>${name}</div><div class="big ${warn?'warn':''}">${big}</div><div class="t2">${sub}</div></div>`;
 const pct=x=>x&&x.resets_at*1000>now?Math.round(x.used_percentage):0;
 const cp=c?.rl?.primary;
 return `<div class="ag-ovs">
 ${card('cc','Claude Code',O?`5h ${pct(O.five_hour)}% · 周 ${pct(O.seven_day)}%`:`今天 ${fmtTok(D.today.o)}`,O?`更新于 ${ago(O.at,now)}`:'输出 token · 官方额度待终端刷新',O&&(pct(O.five_hour)>=85||pct(O.seven_day)>=85))}
 ${c&&!c.error?card('codex','Codex',cp?`${winName(cp.window_minutes)}额度 ${cp.resets_at*1000>now?Math.round(cp.used_percent):0}%`:`近 7 天 ${fmtTok(c.week.o)}`,cp?`${c.rl.plan_type?esc(c.rl.plan_type)+' 套餐 · ':''}截至 ${ago(c.rl.at,now)}`:'输出 token',cp&&cp.used_percent>=85):''}
 ${ds&&!ds.error?card('dsh','dsh',`余额 ${money(ds.balance,ds.currency)}`,`今天 ${money(ds.today)} · 近 7 天 ${money(ds.week)}`,ds.balance!==null&&ds.balance<1):''}
 ${w&&!w.error?card('wb','WorkBuddy',`近 7 天 ${Math.round(w.week)} 积分`,`今天 ${Math.round(w.today)} · 近 30 天 ${Math.round(w.month)}`):''}
 ${X.grok&&!X.grok.error&&!X.grok.none?card('grok','Grok Bot',`本周额度 ${X.grok.resetAt>now?Math.round(X.grok.pct):0}%`,`${esc(X.grok.plan)} · ${X.grok.resetAt>now?fmtLeft(X.grok.resetAt-now)+'后重置':'已重置'}`,X.grok.pct>=85||X.grok.blocked):''}
 ${X.kimi&&!X.kimi.error?card('kimi','Kimi Code',`近 7 天 ${fmtTok(X.kimi.week.o)}`,X.kimi.last?`上次使用 ${ago(X.kimi.last,now)}`:'还没有记录'):''}
 ${X.qoder&&!X.qoder.error?card('qoder','Qoder',`近 7 天 ${['intl','cn'].reduce((t,k)=>t+(X.qoder[k]?.week.n||0),0)} 次回复`,`上次使用 ${ago(Math.max(X.qoder.intl?.last||0,X.qoder.cn?.last||0),now)}`):''}
 ${X.gemini&&!X.gemini.error?card('gemini','Antigravity',`近 7 天 ${X.gemini.week.n} 步`,X.gemini.last?`上次使用 ${ago(X.gemini.last,now)}`:'还没有记录'):''}
 ${X.trae?card('trae','Trae','本机读不到','数据是加密存储的'):''}
 </div>`;}
function agCodex(c,now){if(!c)return '';if(c.error)return `<h2 class="ag-h" id="ag-codex">Codex</h2><div class="card empty">读取失败：${esc(c.error)}</div>`;
 const rl=c.rl,g=(x,t)=>x?gauge(`${t} · ${winName(x.window_minutes)}窗口`,{used_percentage:x.used_percent,resets_at:x.resets_at},now,(+x.window_minutes||0)*6e4):'';
 return `<h2 class="ag-h" id="ag-codex"><span class="dot" style="background:${AG_C.codex}"></span>Codex</h2>
 ${rl?`<div class="grid two">${g(rl.primary,'主额度')}${g(rl.secondary,'次额度')||`<div class="card ag-g"><div><div class="t1">套餐 ${esc(rl.plan_type||'未知')}</div><div class="t2">${rl.credits?.has_credits?`额外额度余额 ${esc(String(rl.credits.balance??'—'))}`:'没有额外购买的额度'}</div>${rl.rate_limit_reached_type?`<div class="t2" style="color:var(--bad)">已触发限额：${esc(rl.rate_limit_reached_type)}</div>`:''}</div></div>`}</div>
 <div class="t2 ag-src">额度来自 Codex 会话记录里最后一次上报，截至 ${new Date(rl.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}（${ago(rl.at,now)}）。之后没再用 Codex 的话，实际额度只会更宽裕。</div>`:'<div class="card empty">会话记录里还没有额度信息，用一次 Codex 后就会出现。</div>'}
 <div class="card sec" style="margin-top:16px"><h3>📈 近 30 天每天输出<span class="m">今天 ${fmtTok(c.today.o)} · 近 7 天 ${fmtTok(c.week.o)}（${c.week.n} 轮）${c.models.length?' · '+c.models.slice(0,3).map(([m,v])=>esc(m)).join('、'):''}</span></h3>
 ${miniBars(c.days,d=>d.o,d=>`输出 ${fmtTok(d.o)} · ${d.n} 轮`,AG_C.codex)}</div>`;}
function agDsh(d,now){if(!d)return '';if(d.error)return `<h2 class="ag-h" id="ag-dsh">dsh</h2><div class="card empty">读取失败：${esc(d.error)}</div>`;
 const low=d.balance!==null&&d.balance<1,left=d.avgDaily>0&&d.balance>0?Math.floor(d.balance/d.avgDaily):null;
 return `<h2 class="ag-h" id="ag-dsh"><span class="dot" style="background:${AG_C.dsh}"></span>dsh</h2>
 <div class="card sec"><div class="ag-kv" style="margin-top:0"><div class="${low?'bad':''}"><b>${money(d.balance,d.currency)}</b><span>当前余额${low?' · 快用完了':''}</span></div><div><b>${money(d.today)}</b><span>今天花费</span></div><div><b>${money(d.week)}</b><span>近 7 天</span></div><div><b>${money(d.month)}</b><span>近 30 天</span></div></div>
 <div class="t2" style="margin-top:8px">${left!==null?`按近 7 天的速度，余额大约还能用 ${left} 天 · `:''}数据更新于 ${ago(d.updatedAt,now)}（打开 dsh 时会刷新）${d.models.length?' · 近 7 天：'+d.models.map(([m,x])=>`${esc(m)} ${money(x.cost)}`).join('、'):''}</div>
 <h3 style="margin-top:14px">📈 近 30 天每天花费</h3>${miniBars(d.days,x=>x.cost,x=>`${money(x.cost)} · ${fmtTok(x.tokens)} token`,AG_C.dsh)}</div>`;}
function agWB(w,now){if(!w)return '';if(w.error)return `<h2 class="ag-h" id="ag-wb">WorkBuddy</h2><div class="card empty">读取失败：${esc(w.error)}</div>`;
 return `<h2 class="ag-h" id="ag-wb"><span class="dot" style="background:${AG_C.wb}"></span>WorkBuddy</h2>
 <div class="grid two"><div class="card sec"><div class="ag-kv" style="margin-top:0;grid-template-columns:repeat(3,1fr)"><div><b>${Math.round(w.today)}</b><span>今天积分</span></div><div><b>${Math.round(w.week)}</b><span>近 7 天</span></div><div><b>${Math.round(w.month)}</b><span>近 30 天</span></div></div>
  ${w.models.length?`<div class="t2" style="margin-top:8px">近 7 天：${w.models.map(([m,v])=>`${esc(m)} ${Math.round(v)}`).join('、')}</div>`:''}
  <h3 style="margin-top:14px">📈 近 30 天每天积分</h3>${miniBars(w.days,x=>x.credits,x=>`${Math.round(x.credits)} 积分 · ${x.n} 个会话`,AG_C.wb)}</div>
 <div class="card sec"><h3>🧾 最近的会话<span class="m">按积分消耗</span></h3>${w.recent.length?w.recent.map(x=>`<div class="chl" style="grid-template-columns:1fr 110px 70px"><span class="clamp" title="${esc(x.title)}">${esc(x.title)}</span><span class="t2">${esc(x.model)}</span><span class="r">${x.credits} 积分</span></div>`).join(''):'<div class="empty">还没有记录</div>'}
  <div class="t2" style="margin-top:8px">剩余积分在 WorkBuddy 账号里，本机没有记录，这里只能统计用掉了多少。</div></div></div>`;}
function agHead(k,name){return `<h2 class="ag-h" id="ag-${k}"><span class="dot" style="background:${AG_C[k]}"></span>${name}</h2>`;}
function agErr(k,name,x){return x&&x.error?agHead(k,name)+`<div class="card empty">读取失败：${esc(x.error)}</div>`:'';}
function agGrok(g,now){if(!g)return '';if(g.error)return agErr('grok','Grok Bot',g);
 if(g.none)return agHead('grok','Grok Bot')+'<div class="card empty">Grok Bot 还没有缓存额度信息，打开一次 Grok Bot 就会有。</div>';
 return agHead('grok','Grok Bot')+`<div class="grid two">${gauge('每周额度',{used_percentage:g.pct,resets_at:Math.round(g.resetAt/1000)},now,7*864e5)}
 <div class="card ag-g"><div><div class="t1">${esc(g.plan||'未知套餐')}</div><div class="t2">${g.blocked?'<span style="color:var(--bad)">额度已用完，暂时发不了消息</span>':'可以正常使用'}</div>${g.prepaid?`<div class="t2">预付余额 $${g.prepaid.toFixed(2)}</div>`:''}<div class="t2">数据读取于 ${ago(g.at,now)}（打开 Grok Bot 时刷新）</div></div></div></div>`;}
function agKimi(k,now){if(!k)return '';if(k.error)return agErr('kimi','Kimi Code',k);
 return agHead('kimi','Kimi Code')+`<div class="card sec"><div class="ag-kv" style="margin-top:0"><div><b>${fmtTok(k.today.o)}</b><span>今天输出</span></div><div><b>${fmtTok(k.week.o)}</b><span>近 7 天输出</span></div><div><b>${fmtTok(k.all.o)}</b><span>累计输出 · ${k.all.n} 步</span></div><div><b>${k.last?ago(k.last,now):'—'}</b><span>上次使用 · ${k.sessions} 个会话</span></div></div>
 <h3 style="margin-top:14px">📈 近 30 天每天输出</h3>${miniBars(k.days,d=>d.o,d=>`输出 ${fmtTok(d.o)} · ${d.n} 步`,AG_C.kimi)}
 <div class="t2" style="margin-top:6px">Kimi Code 本机只记 token，不记账号剩余额度。</div></div>`;}
function agQoder(q,now){if(!q)return '';if(q.error)return agErr('qoder','Qoder',q);
 const one=(x,name)=>x?`<div class="card sec"><h3>${name}<span class="m">${x.sessions} 个会话 · 上次 ${x.last?ago(x.last,now):'—'}</span></h3>
  <div class="ag-kv" style="margin-top:0;grid-template-columns:repeat(3,1fr)"><div><b>${x.today.n}</b><span>今天回复</span></div><div><b>${x.week.n}</b><span>近 7 天</span></div><div><b>${x.all.n}</b><span>累计</span></div></div>
  <h3 style="margin-top:14px">📈 近 30 天每天回复数</h3>${miniBars(x.days,d=>d.n,d=>`${d.n} 次回复`,AG_C.qoder)}
  ${x.recent.length?`<div style="margin-top:10px">${x.recent.map(r=>`<div class="chl" style="grid-template-columns:1fr 80px 90px"><span class="clamp">${esc(r.project)}</span><span class="r">${r.n} 次</span><span class="r">${ago(r.last,now)}</span></div>`).join('')}</div>`:''}</div>`:'';
 return agHead('qoder','Qoder')+`<div class="grid two">${one(q.intl,'国际版')}${one(q.cn,'国内版')}</div><div class="t2 ag-src">Qoder 的积分只在账号里，本机日志没有记录，这里统计的是对话量（AI 回复次数）。</div>`;}
function agGemini(g,now){if(!g)return '';if(g.error)return agErr('gemini','Antigravity（Gemini）',g);
 return agHead('gemini','Antigravity（Gemini）')+`<div class="grid two"><div class="card sec"><div class="ag-kv" style="margin-top:0"><div><b>${g.conversations}</b><span>对话</span></div><div><b>${g.steps}</b><span>累计步数</span></div><div><b>${g.week.n}</b><span>近 7 天步数</span></div><div><b>${g.last?ago(g.last,now):'—'}</b><span>上次使用</span></div></div>
  <h3 style="margin-top:14px">📈 近 30 天（按对话最后修改日）</h3>${miniBars(g.days,d=>d.n,d=>`${d.n} 步`,AG_C.gemini)}</div>
 <div class="card sec"><h3>💬 最近的对话</h3>${g.recent.map(r=>`<div class="chl" style="grid-template-columns:1fr 70px 90px"><span class="clamp" title="${esc(r.title)}">${esc(r.title)}</span><span class="r">${r.n} 步</span><span class="r">${ago(r.t,now)}</span></div>`).join('')||'<div class="empty">还没有对话</div>'}
  <div class="t2" style="margin-top:8px">Antigravity 本机只保存对话，不保存 token 和额度，这里按步数统计使用量。</div></div></div>`;}
function agTrae(t){if(!t)return '';
 return agHead('trae','Trae')+`<div class="card sec"><div class="t2">检测到已安装：${t.apps.map(esc).join('、')}。Trae 把对话和用量存在加密数据库里，本机读不到，额度请在 Trae 里的「账号 → 用量」查看。</div></div>`;}
function vAgent(){
 if(!TOKEN)return `<div class="card empty">需要从桌面的「履迹」快捷方式打开，才能读取本机的 Claude Code 用量。</div>`;
 loadAgent();const D=AG.d,now=Date.now();
 if(D&&D.off)return `<div class="card empty">Agent 额度没有打开。到「设置与备份」里打开后，这里会显示本机 AI 编程工具的用量。</div>`;
 if(!D)return `<div class="card empty">${AG.err?'读取失败：'+esc(AG.err):'正在读取本机的 Claude Code 记录…（第一次需要几秒）'}</div>`;
 const O=D.official,age=O?now-O.at:0;
 const b=D.block,bmax=Math.max(1,...D.blocks.map(x=>x.o));
 const dmax=Math.max(1,...D.days.map(d=>d.o));
 const hmax=Math.max(1,...D.heat.flat());
 const wF=Object.entries(D.weekByF||{}).sort((a,b)=>b[1]-a[1]),wT=wF.reduce((t,[,v])=>t+v,0)||1;
 const AL=agentAlerts(D,now);
 return `${AL.map(a=>`<div class="alert ${a.lv==='bad'?'bad':''}">🤖 ${esc(a.msg)}<span style="flex:1"></span><button class="btn sm ghost" data-act="agsnooze" data-k="${esc(a.k)}">知道了</button></div>`).join('')}${agOverview(D,now)}<h2 class="ag-h" id="ag-cc"><span class="dot" style="background:#d97757"></span>Claude Code</h2><div class="grid two">${gauge('5 小时额度',O?.five_hour,now,5*3600e3)}${gauge('本周额度（所有模型）',O?.seven_day,now,7*864e5)}</div>
 <div class="t2 ag-src">${O?`官方百分比来自 Claude Code 状态栏 · 更新于 ${age<6e4?'刚刚':fmtLeft(age)+'前'}${O.model?' · '+esc(O.model):''}${age>3*3600e3?'（有一阵没刷新了，在终端里用一下 claude 就会更新）':''}`:'还没有官方百分比：已经帮你配置好了 Claude Code 状态栏，在终端里运行一次 <code>claude</code> 并发一条消息后，这里就会显示官方的 5 小时 / 每周额度。'}<span style="flex:1"></span><button class="btn sm ghost" data-act="agentrefresh">↻ 刷新</button></div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>⏱ 当前 5 小时窗口<span class="m">按本机记录估算</span></h3>${b?`
   <div class="ag-win"><span>${hm(b.start)}</span><div class="bar"><i style="width:${Math.min(100,(now-b.start)/(b.end-b.start)*100)}%"></i></div><span>${hm(b.end)}</span></div>
   <div class="ag-kv"><div><b>${fmtTok(b.o)}</b><span>输出 token</span></div><div><b>${b.n}</b><span>次回复</span></div><div><b>${fmtTok(Math.round(b.o/Math.max(.25,(Math.min(now,b.end)-b.start)/36e5)))}</b><span>每小时输出</span></div><div><b>${fmtLeft(b.end-now)}</b><span>后开新窗口</span></div></div>
   <div class="t2" style="margin-top:8px">这个窗口的输出量是最近 12 个窗口里最高值的 ${Math.round(b.o/bmax*100)}%</div>`:'<div class="empty">现在不在任何 5 小时窗口里，下次发消息时开始计时。</div>'}</div>
  <div class="card sec"><h3>📦 用量概况</h3>
   <div class="ag-kv"><div><b>${fmtTok(D.today.o)}</b><span>今天输出</span></div><div><b>${fmtTok(D.week.o)}</b><span>近 7 天输出</span></div><div><b>${D.week.n}</b><span>近 7 天回复</span></div><div><b>${fmtTok(D.week.cr+D.week.cw+D.week.i)}</b><span>近 7 天输入（含缓存）</span></div></div>
   ${wF.length?`<div class="ag-mix">${wF.map(([f,v])=>`<i style="width:${v/wT*100}%;background:${FAM_C[f]||'#c9ced6'}" title="${f} ${Math.round(v/wT*100)}%"></i>`).join('')}</div><div class="t2">${wF.map(([f,v])=>`<span class="dot" style="background:${FAM_C[f]||'#c9ced6'}"></span> ${f} ${Math.round(v/wT*100)}%`).join('　')}　（按输出 token）</div>`:''}</div>
 </div>
 <div class="card sec" style="margin-top:16px"><h3>📈 近 30 天每天输出<span class="m">${Object.keys(FAM_C).filter(f=>D.days.some(d=>d.byF[f])).map(f=>`<span class="dot" style="background:${FAM_C[f]}"></span> ${f}`).join('　')}</span></h3>
  <div class="ag-days">${D.days.map(d=>`<div title="${d.d}：输出 ${fmtTok(d.o)} · ${d.n} 次回复"><div class="st" style="height:${d.o/dmax*100}%">${Object.entries(d.byF).map(([f,v])=>`<i style="flex:${v};background:${FAM_C[f]||'#c9ced6'}"></i>`).join('')}</div><span>${+d.d.slice(8)}</span></div>`).join('')}</div></div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>🕒 近 7 天什么时候在用<span class="m">颜色越深输出越多</span></h3><div class="ag-heat">${D.heat.map((row,i)=>`<span class="t2">周${'一二三四五六日'[i]}</span>${row.map((v,h)=>`<i title="周${'一二三四五六日'[i]} ${h}点：${fmtTok(v)}" style="opacity:${v?.15+.85*v/hmax:.06}"></i>`).join('')}`).join('')}<span></span>${[0,6,12,18].map(h=>`<span class="t2" style="grid-column:span 6">${h}点</span>`).join('')}</div></div>
  <div class="card sec"><h3>📁 近 7 天按项目</h3>${D.projects.length?`<table class="ag-t"><thead><tr><th>项目</th><th>输出</th><th>回复</th><th>最近</th></tr></thead><tbody>${D.projects.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmtTok(x.o)}</td><td>${x.n}</td><td class="t2">${dayDiff(today(),dstr(new Date(x.last)))===0?'今天 '+hm(x.last):dstr(new Date(x.last)).slice(5)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">近 7 天没有记录</div>'}</div>
 </div>
 <div class="card sec" style="margin-top:16px"><h3>🧱 最近的 5 小时窗口</h3>${D.blocks.map(x=>`<div class="chl" style="grid-template-columns:150px 1fr 130px"><span>${dstr(new Date(x.start)).slice(5)} ${hm(x.start)}–${hm(x.end)}</span><div class="bar"><i style="width:${x.o/bmax*100}%"></i></div><span class="r">${fmtTok(x.o)} · ${x.n} 次</span></div>`).join('')}</div>
 <div class="t2" style="margin-top:12px">说明：用量来自本机 <code>~/.claude/projects</code> 里的对话记录，只统计这台电脑上的 Claude Code（包括桌面版的 Code 标签页）。官方额度是按账号算的，在网页版 claude.ai 聊天、其他电脑上的用量也会计入官方百分比，但不会出现在上面的本机统计里。</div>
 ${agCodex(D.others?.codex,now)}${agDsh(D.others?.dsh,now)}${agWB(D.others?.workbuddy,now)}${agGrok(D.others?.grok,now)}${agKimi(D.others?.kimi,now)}${agQoder(D.others?.qoder,now)}${agGemini(D.others?.gemini,now)}${agTrae(D.others?.trae)}`;
}
function vStories(){
 const cov=q=>db.stories.filter(x=>(x.qs||[]).includes(q)).length,done=BQ.filter(cov).length;
 const i1=introEst(db.settings.intro1),i3=introEst(db.settings.intro3),log=(db.settings.introLog||[]).slice(-5).reverse();
 return `<div class="card sec"><h3>🎤 自我介绍<span class="m">按每分钟约 220 字估算 · 写完点「计时练习」大声讲一遍</span></h3><div class="grid two">
  <div class="f"><label>1 分钟版 <span class="t2">${i1.n} 字 · 约 ${i1.sec} 秒</span></label><textarea class="inp" data-intro="intro1" rows="5" placeholder="我是谁 + 最相关的经历 + 为什么适合这个岗位">${esc(db.settings.intro1||'')}</textarea><button class="btn sm" data-act="introprac" data-w="1" style="margin-top:6px">⏱ 计时练习</button></div>
  <div class="f"><label>3 分钟版 <span class="t2">${i3.n} 字 · 约 ${i3.sec} 秒</span></label><textarea class="inp" data-intro="intro3" rows="5" placeholder="展开讲 1~2 个项目：做了什么、难点、结果">${esc(db.settings.intro3||'')}</textarea><button class="btn sm" data-act="introprac" data-w="3" style="margin-top:6px">⏱ 计时练习</button></div></div>
  ${log.length?`<div class="t2" style="margin-top:8px">最近练习：${log.map(l=>`${l.date.slice(5)} ${l.sec}秒/${l.target}秒`).join('　')}</div>`:''}</div>
 <div class="card sec" style="margin-top:16px"><h3>🎯 常见行为面试题<span class="m">已准备 ${done} / ${BQ.length} · 黑底带 ✓ 的已有故事，点白底的直接开写</span></h3><div class="quick">${BQ.map(q=>{const n=cov(q);return `<button class="hb ${n?'on':''}" data-bq="${esc(q)}">${n?'✓ ':''}${esc(q)}</button>`;}).join('')}</div></div>
 <div class="tools" style="margin-top:18px"><b>我的故事 · ${db.stories.length}</b><span style="flex:1"></span><button class="btn primary sm" data-act="addstory">＋ 新故事</button></div>
 ${db.stories.length?`<div class="skgrid" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">${db.stories.map(x=>`<div class="card sk" data-story="${x.id}"><div class="t1">${esc(x.title||'未命名故事')}</div>${[['s','情境'],['t','任务'],['a','行动'],['r','结果']].map(([k,n])=>x[k]?`<div class="t2 clamp"><b style="color:var(--text)">${n}</b> ${esc(x[k])}</div>`:'').join('')}<div class="quick">${(x.qs||[]).map(q=>`<span class="tag">${esc(q)}</span>`).join('')}</div></div>`).join('')}</div>`:'<div class="card empty">用 STAR 法则（情境、任务、行动、结果）把你的经历写成故事。<br>面试官问「讲一个……的经历」时，翻出来就能讲，一个好故事能回答好几道题。</div>'}`;
}
function vPeople(){
 const L=db.people.slice().sort((a,b)=>(a.nextAt||'9999').localeCompare(b.nextAt||'9999')||(b.lastAt||'').localeCompare(a.lastAt||''));
 return `<div class="tools"><span class="t2">内推往往比海投回复率高得多。记下每个人，到了跟进日期会在概览里提醒你。</span><span style="flex:1"></span><button class="btn primary sm" data-act="addperson">＋ 添加联系人</button></div>
 ${L.length?`<div class="card" style="overflow:hidden"><table><thead><tr><th>姓名</th><th>公司 / 职位</th><th>关系</th><th>联系方式</th><th>上次联系</th><th>下次跟进</th><th>相关投递</th><th></th></tr></thead><tbody>${L.map(p=>{const due=p.nextAt&&p.nextAt<=today(),rel=p.company?db.apps.filter(a=>a.company.includes(p.company)||p.company.includes(a.company)):[];
  return `<tr data-person="${p.id}"><td><div class="t1">${esc(p.name)}</div>${p.notes?`<div class="t2 clamp" style="max-width:220px">${esc(p.notes)}</div>`:''}</td><td>${esc(p.company)}<div class="t2">${esc(p.title)}</div></td><td>${p.rel?`<span class="tag">${esc(p.rel)}</span>`:''}</td><td class="t2">${esc(p.contact)}</td><td>${p.lastAt?`${p.lastAt}<div class="t2">${dayDiff(today(),p.lastAt)} 天前</div>`:'—'}</td><td>${p.nextAt?`<span style="color:${due?'var(--bad)':'inherit'};font-weight:${due?700:400}">${p.nextAt}${due?'<br>该联系了':''}</span>`:'—'}</td><td>${rel.map(a=>`<a href="#" class="tag" data-open="${a.id}">${esc(a.company)}</a>`).join(' ')||'—'}</td><td><button class="btn sm" data-contacted="${p.id}">今天联系了</button></td></tr>`;}).join('')}</tbody></table></div>`:'<div class="card empty">还没有联系人。帮你内推的学长、聊过的 HR、面试官……都可以记下来。</div>'}`;
}


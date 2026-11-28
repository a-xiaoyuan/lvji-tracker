// 履迹 · 批量处理、防重复投递、每周小结、投递时机统计
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ---------- 批量处理：「全部投递」里勾选多条，一起改状态或删除 ---------- */
let SEL=new Set();
function listFilter(){return db.apps.filter(a=>(!F.status||a.status===F.status)&&(!F.channel||a.channel===F.channel)&&(!F.q||[a.company,a.role,a.city,a.notes,a.resume].join(' ').toLowerCase().includes(F.q.toLowerCase())));}
function bulkBar(){for(const id of [...SEL])if(!appById(id))SEL.delete(id);if(!SEL.size)return '';
 return `<div class="alert info bulkbar">已选 <b>${SEL.size}</b> 条<select class="inp" data-bulkset><option value="">把进度改成…</option>${ST.map(s=>`<option value="${s.k}">${s.n}</option>`).join('')}</select><button class="btn sm danger" data-act="bulkdel">删除</button><span style="flex:1"></span><button class="btn sm ghost" data-act="selnone">取消选择</button></div>`;}
function bulkStatus(k){const A=db.apps.filter(a=>SEL.has(a.id)&&a.status!==k);if(!A.length){SEL.clear();render();return toast('选中的已经都是这个进度了');}
 const before=A.map(a=>({a,st:a.status,h:a.history.length,ap:a.appliedAt,up:a.updatedAt}));
 for(const a of A)setStatus(a,k,true);SEL.clear();persist();render();
 toast(`已把 ${A.length} 条改成「${SM[k].n}」`,['撤销',()=>{for(const x of before){x.a.status=x.st;x.a.history.length=x.h;x.a.appliedAt=x.ap;x.a.updatedAt=x.up;}persist();render();}]);}
function bulkDelete(){const n=SEL.size;if(!n)return;if(!confirm(`确定删除选中的 ${n} 条投递吗？（删除后可以在提示条上点「撤销」找回）`))return;
 const removed=db.apps.filter(a=>SEL.has(a.id));db.apps=db.apps.filter(a=>!SEL.has(a.id));SEL.clear();persist();render();
 toast(`已删除 ${removed.length} 条`,['撤销',()=>{db.apps.push(...removed);persist();render();}]);}
/* ---------- 防重复投递：输入公司名时提示「这家投过了」 ---------- */
function coMatches(apps,company,role){if(coKey(company).length<2)return [];
 return (apps||[]).filter(a=>a&&sameCo(a.company,company)).map(a=>({a,same:!!role&&!!coKey(role)&&coKey(a.role)===coKey(role)}))
  .sort((x,y)=>(y.same-x.same)||String(y.a.appliedAt||'').localeCompare(String(x.a.appliedAt||'')));}
function dupHtml(company,role){const M=coMatches(db.apps,company,role);if(!M.length)return '';const same=M.some(x=>x.same);
 return `<div class="alert ${same?'bad':''}" style="cursor:default;margin:0;flex-wrap:wrap">${same?'⚠️ 这家的这个岗位你已经记过了：':'💡 这家公司你之前投过：'}${M.slice(0,3).map(({a})=>`<a href="#" data-act="dupopen" data-a="${a.id}">${esc(a.role)||'—'}（${a.appliedAt?a.appliedAt.slice(5).replace('-','/')+' · ':''}${(SM[a.status]||SM.applied).n}）</a>`).join('、')}${M.length>3?` 等 ${M.length} 条`:''}</div>`;}
function dupRefresh(){const b=document.getElementById('dupBox'),c=document.getElementById('nCompany'),r=document.getElementById('nRole');if(!b||!c)return;const h=dupHtml(c.value.trim(),r?r.value.trim():'');b.innerHTML=h;b.hidden=!h;}
/* ---------- 每周小结 ---------- */
function weekNums(apps,from,to){const inR=d=>!!d&&d>=from&&d<to;let sent=0,rep=0,iv=0,ts=0,off=0;
 for(const a of apps||[]){if(!a||typeof a!=='object')continue;if(a.status!=='wish'&&inR(a.appliedAt))sent++;
  for(const e of a.events||[]){if(!e||!e.at||!inR(String(e.at).slice(0,10)))continue;if(e.type==='interview')iv++;else if(e.type==='test')ts++;}
  for(const h of a.history||[]){if(!h||!h.at||!h.from||!inR(String(h.at).slice(0,10)))continue;if(h.to==='offer')off++;if(h.from==='applied'&&h.to!=='wish')rep++;}}
 return {sent,rep,iv,ts,off};}
function addDays(d,n){const x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return dstr(x);}
function weekReport(apps,ws){return {from:ws,to:addDays(ws,6),cur:weekNums(apps,ws,addDays(ws,7)),prev:weekNums(apps,addDays(ws,-7),ws)};}
function weekNow(){const dow=new Date().getDay(),ws=dstr(weekStart());return dow===1?{ws:addDays(ws,-7),lab:'上周'}:{ws,lab:'本周'};}
function weekNext(ws){const nf=addDays(ws,7),nt=addDays(ws,14),td=today();
 const up=allEvents().filter(({e})=>!e.done&&e.at&&(e.type==='interview'||e.type==='test')&&e.at.slice(0,10)>=(nf>td?nf:td)&&e.at.slice(0,10)<nt).sort((x,y)=>x.e.at.localeCompare(y.e.at));
 const fol=buildTodayQueue(db.apps,td,addDays(td,1),replyStats(),0).filter(x=>x.kind==='stale').slice(0,3);return {up,fol};}
function weekCard(){const dow=new Date().getDay();if(dow!==0&&dow!==1)return '';const W=weekNow();if(db.settings.weekCardHide===W.ws)return '';
 const R=weekReport(db.apps,W.ws),c=R.cur,p=R.prev,N=weekNext(W.ws);if(!c.sent&&!c.rep&&!c.iv&&!c.ts&&!p.sent)return '';
 const cmp=(x,y)=>x===y?'<i class="t2">和上周一样</i>':`<i style="color:${x>y?'var(--ok)':'var(--bad)'}">${x>y?'↑':'↓'} ${Math.abs(x-y)}</i>`;
 return `<div class="card sec weekcard"><h3>📅 ${W.lab}小结<span class="m">${R.from.slice(5).replace('-','/')} ~ ${R.to.slice(5).replace('-','/')}</span></h3>
 <div class="wkc">${[['投递',c.sent,p.sent],['有进展',c.rep,p.rep],['笔试',c.ts,p.ts],['面试',c.iv,p.iv]].map(([l,x,y])=>`<div><b>${x}</b><span>${l}</span>${cmp(x,y)}</div>`).join('')}</div>
 ${c.off?`<div style="margin-top:8px">🎉 这周拿到 ${c.off} 个 Offer</div>`:''}
 <div class="t2" style="margin-top:8px">接下来：${N.up.length?`${N.up.length} 场笔试 / 面试，最近的是 ${N.up[0].e.at.slice(5,10).replace('-','/')} ${esc(N.up[0].a.company)}`:'还没有安排笔试面试'}${N.fol.length?`；该跟进 ${N.fol.map(x=>esc(x.company)).join('、')}`:''}</div>
 <div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm" data-act="weekimg">🖼 生成图片</button><button class="btn sm" data-view="review">看详细回顾 →</button><span style="flex:1"></span><button class="btn sm ghost" data-act="weekhide" data-k="${W.ws}">收起</button></div></div>`;}
function openWeekImg(){const W=weekNow(),R=weekReport(db.apps,W.ws),N=weekNext(W.ws);
 aiModal(`🖼 ${W.lab}求职小结`,`<canvas id="posterCv" width="720" height="960" style="width:100%;border-radius:12px;display:block"></canvas><div class="mfoot"><button class="btn" data-act="mclose">关闭</button><button class="btn primary" data-act="posterdown" data-name="${W.lab}求职小结-${R.from}.png">⬇ 保存图片</button></div>`);
 drawWeek(W.lab,R,N);}
function drawWeek(lab,R,N){const cv=document.getElementById('posterCv');if(!cv)return;const g=cv.getContext('2d'),c=R.cur,p=R.prev;
 const gr=g.createLinearGradient(0,0,720,960);gr.addColorStop(0,'#1b1b2f');gr.addColorStop(1,'#3a2b5c');g.fillStyle=gr;g.fillRect(0,0,720,960);
 const F=(w,s)=>`${w} ${s}px "PingFang SC","Microsoft YaHei",sans-serif`;
 g.fillStyle='#ffffff';g.font=F(900,56);g.fillText(lab+'求职小结',56,130);
 g.fillStyle='#c9c4e5';g.font=F(400,28);g.fillText(`${R.from} ~ ${R.to}`,56,182);
 [['投递',c.sent,p.sent],['有进展',c.rep,p.rep],['笔试',c.ts,p.ts],['面试',c.iv,p.iv]].forEach(([l,x,y],i)=>{const X=56+(i%2)*312,Y=240+Math.floor(i/2)*200;
  g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(X,Y,288,170);g.fillStyle='#ffd166';g.font=F(900,64);g.fillText(String(x),X+28,Y+86);
  g.fillStyle='#c9c4e5';g.font=F(400,26);g.fillText(l,X+28,Y+132);
  g.fillStyle=x>y?'#7ee2b8':x<y?'#ff9aa2':'#8f89ad';g.font=F(700,24);g.fillText(x===y?'和上周一样':`${x>y?'↑':'↓'} ${Math.abs(x-y)} 较上周`,X+150,Y+132);});
 g.fillStyle='#ffffff';g.font=F(700,32);g.fillText('接下来',56,700);
 g.fillStyle='#e8e4f5';g.font=F(400,26);
 const L=[];if(c.off)L.push(`🎉 这周拿到 ${c.off} 个 Offer`);
 L.push(N.up.length?`${N.up.length} 场笔试 / 面试，最近：${N.up[0].e.at.slice(5,10)} ${N.up[0].a.company}`:'还没有安排笔试面试，继续投');
 if(N.fol.length)L.push('该跟进：'+N.fol.map(x=>x.company).join('、'));
 L.forEach((t,i)=>g.fillText(t.slice(0,24),56,756+i*46));
 g.fillStyle='#8f89ad';g.font=F(400,24);g.fillText(`履迹 · ${today()}`,56,920);}
/* ---------- 投递时机：星期几、几点投回复最好 ---------- */
function timingStats(apps){const W=['周日','周一','周二','周三','周四','周五','周六'],S=[['上午（11 点前）',0,11],['中午（11～14 点）',11,14],['下午（14～18 点）',14,18],['晚上（18 点后）',18,24]];
 const wd={},sl={};let n=0;
 const bump=(M,k,a,days)=>{const r=M[k]=M[k]||{n:0,rep:0,dsum:0,dn:0};r.n++;if(appReplied(a))r.rep++;if(days!=null){r.dsum+=days;r.dn++;}};
 for(const a of apps||[]){if(!a||typeof a!=='object'||a.status==='wish'||!a.appliedAt)continue;n++;
  const first=(a.history||[]).find(h=>h&&!h.from&&String(h.at||'').slice(0,10)===a.appliedAt),hr=first?+String(first.at).slice(11,13):NaN;
  const nx=[...(a.events||[]).filter(e=>e&&e.at&&e.type!=='note'&&e.type!=='followup').map(e=>String(e.at).slice(0,10)),...(a.history||[]).filter(h=>h&&h.from==='applied'&&h.at).map(h=>String(h.at).slice(0,10))].filter(d=>d>=a.appliedAt).sort()[0];
  const days=nx&&appReplied(a)?dayDiff(nx,a.appliedAt):null;
  bump(wd,new Date(a.appliedAt+'T00:00:00').getDay(),a,days);
  if(!isNaN(hr)){const s=S.find(([,x,y])=>hr>=x&&hr<y);if(s)bump(sl,s[0],a,days);}}
 const rows=(M,order)=>order.filter(k=>M[k]).map(k=>({k,n:M[k].n,rep:M[k].rep,rate:M[k].rep/M[k].n,avg:M[k].dn?M[k].dsum/M[k].dn:null}));
 return {n,week:rows(wd,[1,2,3,4,5,6,0]).map(r=>({...r,k:W[r.k]})),slot:rows(sl,S.map(s=>s[0]))};}
function timingCard(){const T=timingStats(db.apps);if(!T.n)return '';
 const head='<h3>什么时候投回复最好<span class="m">回复率 · 平均几天有回音 · 少于 3 次的不评星</span></h3>';
 if(T.n<10)return `<div class="card sec" style="margin-top:16px">${head}<div class="t2">再投 ${10-T.n} 条就能开始看出规律。</div></div>`;
 const blk=(title,rows)=>{if(!rows.length)return '';const ok=rows.filter(r=>r.n>=3&&r.rep>0),best=ok.length?ok.reduce((x,y)=>y.rate>x.rate?y:x):null;
  return `<div><h4 class="tmh">${title}</h4>${rows.map(r=>`<div class="chl w"><span>${r===best?'⭐ ':''}${esc(r.k)}</span><div class="bar"><i style="width:${Math.round(r.rate*100)}%"></i></div><span class="r">${r.n} 次 · ${Math.round(r.rate*100)}%${r.avg!=null?` · 约 ${+r.avg.toFixed(1)} 天`:''}</span></div>`).join('')}</div>`;};
 return `<div class="card sec" style="margin-top:16px">${head}${jobInsights(db.apps).map(x=>`<div style="padding:2px 0">💡 ${esc(x)}</div>`).join('')}<div class="grid tmg">${blk('星期几投',T.week)}${blk('几点投',T.slot)||'<div class="t2" style="align-self:center">「几点投」只统计当天就记进履迹的投递（用扩展自动记录的都算），攒够了就会出现在这里。</div>'}</div></div>`;}

/* ---------- 手机查看（可选，默认关闭）：本机小助手在局域网里开一个只读小页面 ---------- */
const PHONE_API='http://127.0.0.1:47321/api/phone';let PHONE=null;
function phoneCard(){return `<div class="card set"><h3>📱 手机上看（可选）</h3><p>打开后，手机连上和这台电脑<b>同一个 Wi-Fi</b>，就能在手机浏览器里看接下来的笔试面试和投递进度。手机上<b>只能看、不能改</b>，也看不到备注、联系人、薪资这些内容。电脑和履迹要开着。</p><div id="phoneBox" class="t2">读取中…</div></div>`;}
function phoneHtml(j){if(!j.on)return `${j.error?`<div class="alert bad" style="cursor:default">没打开：${esc(j.error)}</div>`:''}<div class="row"><button class="btn primary" data-act="phoneon">打开手机查看</button></div>`;
 return `<div class="row" style="gap:8px;align-items:center"><span class="tag" style="color:var(--ok)">✓ 已打开</span><button class="btn sm" data-act="phonereset" title="旧链接会失效，手机要用新链接重新打开">换一个新链接</button><button class="btn sm" data-act="phoneoff">关闭</button></div>
 ${j.urls.length?`<p style="margin:12px 0 6px">手机链接（复制后发到微信「文件传输助手」，在手机上点开）：</p>${j.urls.map(u=>`<div class="row" style="gap:8px;align-items:center;margin-bottom:6px"><code class="plink">${esc(u.replace(/#.*/,'#••••••'))}</code><button class="btn sm primary" data-act="phonecopy" data-u="${esc(u)}">复制链接</button></div>`).join('')}${j.urls.length>1?'<p class="t2">有好几个地址时，一般用 192.168 开头的那个；打不开就换下一个试试。</p>':''}`:'<p style="margin-top:10px">没找到这台电脑的局域网地址，确认电脑已经连上 Wi-Fi 或网线，再点「换一个新链接」刷新。</p>'}
 <p class="t2" style="margin-top:8px">第一次打开时，Windows 可能会弹出「是否允许 Node.js 访问网络」，勾「专用网络」再点「允许」，手机才连得上。链接里带着访问码，别发给别人；不用时点「关闭」。</p>`;}
async function phoneFill(){const el=document.getElementById('phoneBox');if(!el)return;try{const r=await fetch(PHONE_API,{headers:{'x-token':TOKEN}});if(!r.ok)throw 0;PHONE=await r.json();el.innerHTML=phoneHtml(PHONE);}catch{el.textContent='连不上本机小助手。小助手更新后要重启一次：关掉履迹，在任务管理器里结束「Node.js」，再从桌面快捷方式打开。';}}
async function phoneSet(on,reset){const el=document.getElementById('phoneBox');try{const r=await fetch(PHONE_API,{method:'POST',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify({on,reset})});if(!r.ok)throw 0;PHONE=await r.json();if(el)el.innerHTML=phoneHtml(PHONE);
  toast(!on?'已关闭手机查看':PHONE.on?(reset?'已换成新链接，旧链接失效了':'已打开，复制链接发到手机上'):'没能打开，看看设置页里的提示');}catch{toast('连不上本机小助手，从桌面快捷方式重新打开履迹试试');}}

/* ---------- HR 回复：扩展在 Boss 聊天里看到 HR 发来的消息，给对应投递记一笔 ---------- */
function replyApp(apps,it){if(!it||!it.company)return null;const L=(apps||[]).filter(a=>a&&sameCo(a.company,it.company));
 return (it.role&&L.find(a=>coKey(a.role)===coKey(it.role)))||L.find(a=>!['rejected','dropped'].includes(a.status))||null;}
function addReply(a,it,at){if(!a)return false;a.events=a.events||[];if(a.events.some(e=>e&&e.type==='reply'))return false;
 const t=String(it.text||'').replace(/\s+/g,' ').trim();
 a.events.push({id:uid(),type:'reply',at,title:'HR 回复'+(t?'：'+t.slice(0,40)+(t.length>40?'…':''):''),place:'',done:true,rating:0,questions:'',review:''});
 if(it.hr&&!a.contact)a.contact=String(it.hr);return true;}
function localAt(ms){const d=new Date(ms||Date.now());return dstr(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes());}

/* ---------- 邮箱收信：小助手从 QQ 邮箱里挑出的招聘邮件，先放在概览「待处理的邮件」里，点「处理」才识别入账 ---------- */
const MAIL_API='http://127.0.0.1:47321/api/mail';let MAIL=null;
const MAILK={interview:['面试','var(--accent)'],test:['笔试/测评','var(--accent)'],offer:['Offer','var(--ok)'],rejected:['拒信','var(--muted)'],unknown:['通知','var(--muted)']};
function addMails(list,items){const have=new Set(list.map(m=>m.id));for(const it of items){if(!it||have.has(it.id))continue;have.add(it.id);
  list.unshift({id:it.id,at:+it.at||Date.now(),subj:String(it.subj||String(it.text||'').split('\n')[0]).slice(0,300),hr:String(it.hr||'').slice(0,200),company:String(it.company||'').slice(0,40),text:String(it.text||'').slice(0,8000)});}
 list.sort((a,b)=>b.at-a.at);list.length=Math.min(list.length,100);return list;}
function mailCard(){const L=db.mails||[];if(!L.length)return '';const show=L.slice(0,5);
 return `<div class="card mailcard"><div class="ch"><h3>📧 待处理的邮件 <span class="t2">${L.length} 封</span></h3>${L.length>1?'<button class="btn sm" data-act="mailskipall">全部忽略</button>':''}</div>
 ${show.map(m=>{const k=MAILK[classifyNotice(m.text).kind]||MAILK.unknown,d=new Date(m.at);return `<div class="mrow"><span class="tag" style="color:${k[1]};border-color:${k[1]}">${k[0]}</span><div class="mx"><b>${esc(m.subj||'（无标题）')}</b><div class="t2">${esc(m.hr.replace(/\s*<.*>$/,'')||'')} · ${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}</div></div><button class="btn sm primary" data-act="mailgo" data-id="${esc(m.id)}">处理</button><button class="btn sm" data-act="mailskip" data-id="${esc(m.id)}">忽略</button></div>`;}).join('')}
 ${L.length>show.length?`<p class="t2" style="margin:6px 0 0">还有 ${L.length-show.length} 封，处理完上面的会接着显示</p>`:''}<p class="t2" style="margin:8px 0 0">「处理」会把邮件放进「粘贴通知入账」，你点「识别入账」才会改记录。</p></div>`;}
function mailGo(id){const m=(db.mails||[]).find(x=>x.id===id);if(!m)return;db.mails=db.mails.filter(x=>x.id!==id);persist();render();openNotice(m.text);}
function mailSkip(id){const old=db.mails.slice();db.mails=id?db.mails.filter(x=>x.id!==id):[];persist();render();toast(id?'忽略了这封邮件':'全部忽略了',['撤销',()=>{db.mails=old;persist();render();}]);}
function mailCardSet(){return `<div class="card set"><h3>📧 邮箱收信（可选）</h3><p>打开后，小助手每 10 分钟看一眼你的 QQ 邮箱，把<b>像招聘通知的邮件</b>（面试、笔试、测评、录用、拒信、投递反馈）放到概览的「待处理的邮件」里。只读，不删邮件、不标已读、不发信；别的邮件不保存。电脑和履迹要开着。</p><div id="mailBox" class="t2">读取中…</div></div>`;}
function mailHtml(j){const t=j.lastCheck?new Date(j.lastCheck):null,when=t?`${t.getMonth()+1}/${t.getDate()} ${pad(t.getHours())}:${pad(t.getMinutes())}`:'';
 const err=j.lastError?`<div class="alert bad" style="cursor:default;margin:10px 0 0">${esc(j.lastError)}</div>`:'';
 if(j.on)return `<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><span class="tag" style="color:var(--ok)">✓ 已打开</span><span>${esc(j.user)}</span><button class="btn sm primary" data-act="mailcheck" ${j.busy?'disabled':''}>${j.busy?'正在查看…':'现在查一次'}</button><button class="btn sm" data-act="mailoff">关闭</button></div>
  <p class="t2" style="margin:8px 0 0">${when?`上次查看：${when}`:'还没查过'}${j.found?` · 一共找到 ${j.found} 封招聘邮件`:''}</p>${err}`;
 return `<div class="mform"><label>QQ 邮箱地址<input class="inp" id="mlUser" placeholder="例如 12345678@qq.com" value="${esc(j.user||'')}" autocomplete="off"></label>
  <label>授权码<input class="inp" id="mlPass" type="password" autocomplete="new-password" placeholder="${j.hasPass?'已保存过，不换就留空':'16 位字母，不是 QQ 密码'}"></label></div>
  <details class="tmore" style="margin:8px 0"><summary>授权码在哪拿？</summary><ol style="margin:6px 0 0;padding-left:20px;line-height:1.8"><li>电脑浏览器打开 QQ 邮箱网页版并登录</li><li>点右上角「设置」→「账号与安全」（旧版是「设置」→「账户」）</li><li>找到「POP3/IMAP/SMTP/Exchange/CardDAV 服务」，打开「IMAP/SMTP 服务」</li><li>按提示用手机发短信验证，页面会显示一串授权码，复制过来填上</li></ol><p style="margin:6px 0 0">授权码只存在这台电脑的小助手文件夹里，履迹页面也读不回来。不用了可以点「忘掉」，或者在 QQ 邮箱设置里把这个授权码停用。</p></details>
  <div class="row" style="gap:8px"><button class="btn primary" data-act="mailon">打开收信</button>${j.user||j.hasPass?'<button class="btn sm" data-act="mailforget">忘掉邮箱和授权码</button>':''}</div>${err}`;}
async function mailFill(){const el=document.getElementById('mailBox');if(!el)return;try{const r=await fetch(MAIL_API,{headers:{'x-token':TOKEN}});if(!r.ok)throw 0;MAIL=await r.json();el.innerHTML=mailHtml(MAIL);}catch{el.textContent='连不上本机小助手。小助手更新后要重启一次：关掉履迹，在任务管理器里结束「Node.js」，再从桌面快捷方式打开。';}}
async function mailSet(b,busyMsg){const el=document.getElementById('mailBox');if(busyMsg&&el)el.innerHTML=`<p>${busyMsg}</p>`;
 try{const r=await fetch(MAIL_API,{method:'POST',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify(b)});const j=await r.json().catch(()=>({}));if(!r.ok){mailFill();return toast(j.error||'没设置成功');}
  MAIL=j;const e=document.getElementById('mailBox');if(e)e.innerHTML=mailHtml(j);
  if(b.on===true)toast(j.on&&!j.lastError?'邮箱收信已打开，查到招聘邮件会出现在概览里':j.on?'打开了，但这次没查成功，看看设置页里的提示':'没打开：先填邮箱地址和授权码');
  else if(b.on===false)toast('已关闭邮箱收信');else if(b.forget)toast('已忘掉邮箱和授权码');else if(b.check)toast(j.lastError?'没查成功，看看设置页里的提示':'查好了');
  setTimeout(pullInbox,300);}catch{toast('连不上本机小助手，从桌面快捷方式重新打开履迹试试');}}

/* ---------- 左边栏：常用页面常驻，其余收进「更多」（设置 → 外观 里可以改） ---------- */
const NAV_DEF=['dash','board','list','cal','bank','resume'];let NAV_OPEN=false;
function navPins(){const p=db.settings.navPin;return Array.isArray(p)?p.filter(k=>VIEWS.some(v=>v[0]===k)):NAV_DEF;}
function navSplit(){const P=navPins(),ok=([k])=>k!=='settings'&&(k!=='agent'||agShow()||view==='agent');
 return {main:VIEWS.filter(v=>ok(v)&&P.includes(v[0])),more:VIEWS.filter(v=>ok(v)&&!P.includes(v[0]))};}
function navList(){return [...navSplit().main.map(v=>v[0]),'settings'];}
function navHtml(cnt){const {main,more}=navSplit(),b=([k,n])=>`<button data-view="${k}" title="${n}" class="${view===k?'on':''}">${svg(k)}${n}${cnt[k]?`<span class="cnt">${cnt[k]}</span>`:''}</button>`;
 const open=NAV_OPEN||more.some(([k])=>k===view);
 return main.map(b).join('')+(more.length?`<details class="navmore"${open?' open':''}><summary title="更多页面"><span class="nmi">⋯</span>更多</summary>${more.map(b).join('')}</details>`:'')+'<div class="navg"></div>'+b(['settings','设置与备份']);}
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('navmore'))NAV_OPEN=e.target.open;},true);
function navPinCard(){const P=navPins();return `<div class="card set"><h3>🧭 左边栏</h3><p>勾上的页面一直显示在左边栏，没勾的收在「更多」里，点开就能用。</p><div class="navpins">${VIEWS.filter(([k])=>k!=='settings').map(([k,n])=>`<label><input type="checkbox" data-navpin="${k}" ${P.includes(k)?'checked':''}> ${n}</label>`).join('')}</div><div class="row" style="margin-top:10px"><button class="btn sm" data-act="navreset">恢复默认</button></div></div>`;}

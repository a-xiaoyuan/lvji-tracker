// 履迹 · 力扣同步
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 力扣同步（只读公开主页） ========== */
const LC_URL='http://127.0.0.1:47321/api/leetcode',LC_DN={easy:'简单',medium:'中等',hard:'困难'};let LC_RUN=false;
const lcLink=slug=>'https://leetcode.cn/problems/'+encodeURIComponent(slug)+'/';
const lcDay=t=>dstr(new Date(t));
async function lcSync(force,quiet){const u=String(db.settings.lcUser||'').trim();if(!u||LC_RUN)return;
 if(!TOKEN){db.lcErr='要从桌面的「履迹」快捷方式打开，才能同步力扣';return;}
 LC_RUN=true;const st=document.getElementById('lcStat');if(st)st.textContent='正在同步…';
 try{const r=await fetch(`${LC_URL}?u=${encodeURIComponent(u)}${force?'&force=1':''}`,{headers:{'x-token':TOKEN},cache:'no-store'});const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.solved)throw new Error(j.error||(r.status===404?'助手版本太旧，重新打开一次履迹':'HTTP '+r.status));
  const old=db.lc;db.lc=j;db.lcErr='';
  if(old&&old.user===j.user&&j.solved.all>old.solved.all){toast(`🧩 力扣新通过 ${j.solved.all-old.solved.all} 题，累计 ${j.solved.all} 题`);skHit(innerWidth-160,90,'pon');}
  persist();}
 catch(e){db.lcErr=e.message;if(!quiet)toast('😵 力扣同步失败：'+e.message,null,7000);}
 finally{LC_RUN=false;}
 if(view==='settings'||(view==='dash'&&!document.querySelector('#view input:focus,#view textarea:focus')&&!document.getElementById('modal').classList.contains('on')))render();}
function lcToday(){const L=db.lc,td=today();if(!L)return null;const ac=L.recent.filter(x=>lcDay(x.time)===td);
 return {ac,subs:L.calendar?.[td]||0,dailyDone:!!(L.daily&&ac.some(x=>x.slug===L.daily.slug))};}
const lcDf=d=>d?`<span class="lcdf ${d}">${LC_DN[d]||d}</span>`:'';
function lcCard(){if(!db.settings.lcUser)return '';const L=db.lc;
 if(!L)return `<div class="card sec lc"><h3>🧩 力扣<span class="m"><a href="#" data-act="lcsync">同步</a></span></h3><div class="empty">${db.lcErr?'😵 '+esc(db.lcErr):'正在同步…'}</div></div>`;
 const T=lcToday(),S=L.solved,N=L.total,td=today();
 // 近 16 周的提交热力图：一列一周，周一在上
 const end=new Date(td+'T00:00'),start=new Date(+end-((end.getDay()+6)%7+7*15)*864e5),cells=[];
 for(let t=+start;t<=+end;t+=864e5){const d=dstr(new Date(t)),n=L.calendar?.[d]||0;cells.push(`<i class="l${n?Math.min(4,1+Math.floor(Math.log2(n))):0}" title="${d}：${n?`提交 ${n} 次`:'没有提交'}"></i>`);}
 const tg={};for(const x of L.recent)for(const t of x.tags||[])tg[t]=(tg[t]||0)+1;const top=Object.entries(tg).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const bar=k=>`<div class="lcb ${k}"><span>${LC_DN[k]}</span><b>${S[k]}</b><span class="t2">/ ${N[k]}</span><div class="rbar"><i style="width:${N[k]?Math.max(1.5,S[k]/N[k]*100):0}%"></i></div></div>`;
 return `<div class="card sec lc"><h3>🧩 力扣 · ${esc(L.name)}<span class="m">${ago(L.at,Date.now())}同步 · <a href="#" data-act="lcsync">刷新</a> · <a href="https://leetcode.cn/u/${encodeURIComponent(L.user)}/" target="_blank" rel="noopener noreferrer">主页 ↗</a></span></h3>
 ${db.lcErr?`<div class="alert" style="margin-bottom:10px">😵 上次同步失败：${esc(db.lcErr)}</div>`:''}
 <div class="lcg"><div class="lcn"><div><b class="lcbig">${S.all}</b><span class="t2"> 题已解决</span></div>${['easy','medium','hard'].map(bar).join('')}</div>
 <div class="lch"><div class="lcheat">${cells.join('')}</div><div class="t2">近 16 周 · 一共 ${L.activeDays} 天有提交${L.streak?` · 连续 ${L.streak} 天`:''} · 今天${T.subs?`提交 ${T.subs} 次，通过 ${T.ac.length} 题`:'还没提交'}</div></div></div>
 ${L.daily?`<div class="lcdaily ${T.dailyDone?'done':''}"><span class="tag">每日一题</span><b>${esc(L.daily.id)}. ${esc(L.daily.title)}</b>${lcDf(L.daily.difficulty)}<span style="flex:1"></span>${T.dailyDone?'<span class="lcok">✓ 今天已完成</span>':ext(lcLink(L.daily.slug),'去做 ↗','btn sm primary')}</div>`:''}
 ${L.recent.length?`<div class="lcrec"><div class="lct"><span class="t2">最近通过</span>${top.length?`<span class="t2">最近常练：${top.map(([t,n])=>esc(t)+' '+n).join(' · ')}</span>`:''}</div>${L.recent.slice(0,6).map(x=>`<a class="lcr" href="${esc(lcLink(x.slug))}" target="_blank" rel="noopener noreferrer"><span class="lcrt">${esc(x.id)}. ${esc(x.title)}</span>${lcDf(x.difficulty)}<span class="t2 lcrg">${(x.tags||[]).slice(0,3).map(esc).join(' · ')}</span><span class="t2">${lcDay(x.time)===td?'今天':ago(x.time,Date.now())}</span></a>`).join('')}</div>`:'<div class="t2" style="margin-top:10px">力扣只公开最近的通过记录，刷一道题这里就会出现。</div>'}</div>`;}
function lcCtx(){const L=db.lc;if(!L)return '未同步';const T=lcToday();
 return `累计解决 ${L.solved.all} 题（简单 ${L.solved.easy}、中等 ${L.solved.medium}、困难 ${L.solved.hard}），${L.activeDays} 天有提交，连续 ${L.streak} 天，今天通过 ${T.ac.length} 题；最近通过：${L.recent.slice(0,10).map(x=>`${x.title}（${LC_DN[x.difficulty]||''}${x.tags?.length?'，'+x.tags.slice(0,2).join('/'):''}）`).join('、')||'无'}`;}
function lcSave(){const v=(document.getElementById('lcU')?.value||'').trim().replace(/^https?:\/\/leetcode\.cn\/u\//,'').replace(/\/.*$/,'');
 if(!v)return toast('先填力扣用户名');if(v!==db.settings.lcUser){db.lc=null;db.lcErr='';}db.settings.lcUser=v;persist();lcSync(true).then(()=>{if(db.lc&&!db.lcErr)toast(`已连上力扣：${db.lc.name}，累计 ${db.lc.solved.all} 题`);});}

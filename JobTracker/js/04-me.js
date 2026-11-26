// 履迹 · 我自己：日记、能力树、故事库、人脉
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 我自己：日记 / 能力 / 故事 / 人脉 ========== */
let jDate=today();
function jEntry(d,create){let e=db.journal.find(x=>x.date===d);if(!e&&create){e={id:uid(),date:d,mood:0,text:'',hours:'',tags:'',habits:{}};db.journal.push(e);}return e;}
function jActive(ds){const e=jEntry(ds);return !!e&&!!(e.text||e.mood||+e.hours||Object.values(e.habits||{}).some(Boolean));}
function dayScore(ds){const e=jEntry(ds);let n=0;if(e){n+=Object.values(e.habits||{}).filter(Boolean).length;if(e.text)n++;if(+e.hours)n++;}n+=db.apps.filter(a=>a.appliedAt===ds).length;for(const {e:v} of allEvents())if(v.done&&v.at&&v.at.slice(0,10)===ds)n++;return n;}
function streak(){let n=0;const d=new Date();if(!jActive(dstr(d)))d.setDate(d.getDate()-1);while(jActive(dstr(d))){n++;d.setDate(d.getDate()-1);}return n;}
function vJournal(){
 const e=jEntry(jDate)||{mood:0,text:'',hours:'',tags:'',habits:{}},D=new Date(jDate+'T00:00');
 const end=new Date();end.setHours(0,0,0,0);const start=new Date(end);start.setDate(end.getDate()-((end.getDay()+6)%7)-7*51);
 let cols='';for(let w=0;w<52;w++){let c='';for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+w*7+i);if(d>end){c+='<i style="visibility:hidden"></i>';continue;}const ds=dstr(d),sc=dayScore(ds);c+=`<i style="--w:${w}" class="hm${Math.min(4,sc)} ${ds===jDate?'sel':''}" data-jday="${ds}" title="${ds}：活跃 ${sc}"></i>`;}cols+=`<div>${c}</div>`;}
 const month=today().slice(0,7),mDays=db.journal.filter(x=>x.date.startsWith(month)&&jActive(x.date)).length,hours=db.journal.reduce((s,x)=>s+(+x.hours||0),0);
 const all=db.journal.filter(x=>jActive(x.date)).sort((a,b)=>b.date.localeCompare(a.date));
 const moodAvg=(()=>{const L=all.filter(x=>x.mood).slice(0,7);return L.length?MOODS[Math.round(L.reduce((s,x)=>s+x.mood,0)/L.length)-1]:'—';})();
 return `<div class="grid kpis">
  <div class="card kpi"><div class="l">求职第</div><div class="v">${huntDays()}<span style="font-size:15px"> 天</span></div><div class="h">从 ${huntStart()} 开始</div></div>
  <div class="card kpi"><div class="l">连续记录</div><div class="v">${streak()}<span style="font-size:15px"> 天</span></div><div class="h">别断了 🔥</div></div>
  <div class="card kpi"><div class="l">本月记录</div><div class="v">${mDays}<span style="font-size:15px"> 天</span></div><div class="h">共 ${all.length} 篇</div></div>
  <div class="card kpi"><div class="l">累计学习</div><div class="v">${+hours.toFixed(1)}<span style="font-size:15px"> 小时</span></div><div class="h">日记里记的时长</div></div>
  <div class="card kpi"><div class="l">近 7 篇心情</div><div class="v">${moodAvg}</div><div class="h">照顾好自己</div></div></div>
 <div class="card sec" style="margin-top:16px"><h3>活跃热力图<span class="m">近一年 · 打卡、日记、投递、完成面试都会点亮，点格子查看那天</span></h3><div class="hm">${cols}</div>
  <div class="hmleg">少<i style="background:var(--soft)"></i><i style="background:#ffc2dc"></i><i style="background:#ff2d87"></i><i style="background:#7b73f5"></i><i style="background:#ff2d87"></i>多</div></div>
 <div class="grid two" style="margin-top:16px">
  <div class="card sec"><h3>📝 ${jDate===today()?'今天':`${D.getMonth()+1} 月 ${D.getDate()} 日`} · 星期${WK[D.getDay()]}<span class="m"><input type="date" class="inp" data-jdate="1" value="${jDate}" max="${today()}" style="padding:3px 8px"></span></h3>
   <div class="t2" style="margin-bottom:6px">心情</div><div class="moods">${MOODS.map((m,i)=>`<button data-jmood="${i+1}" class="${e.mood===i+1?'on':''}">${m}</button>`).join('')}</div>
   <div class="t2" style="margin:12px 0 6px">今日打卡</div><div class="quick">${db.habits.map(h=>`<button class="hb ${e.habits?.[h.id]?'on':''}" data-jh="${h.id}">${h.icon} ${esc(h.name)}</button>`).join('')||'<span class="t2">在下方添加打卡项</span>'}</div>
   <div class="fg" style="margin-top:12px"><div class="f full"><label>今天做了什么、学到了什么、想对自己说的话</label><textarea class="inp" data-j="text" rows="7" placeholder="比如：刷了 3 道链表题，搞懂了 Redis 持久化；面试有点紧张，下次先深呼吸。">${esc(e.text)}</textarea></div>
   <div class="f"><label>学习时长（小时）</label><input class="inp" type="number" min="0" step="0.5" data-j="hours" value="${esc(e.hours)}"></div>
   <div class="f"><label>标签</label><input class="inp" data-j="tags" value="${esc(e.tags)}" placeholder="如：Redis，项目，面试"></div></div>
   <div class="t2" style="margin-top:10px">✓ 自动保存</div></div>
  <div class="card sec"><h3>📚 过往记录<span class="m">${all.length} 篇</span></h3><div style="max-height:520px;overflow:auto">
   ${all.length?all.slice(0,60).map(x=>`<div class="ev-row" data-jday="${x.date}"><div class="when ${x.date===today()?'today':''}"><span>${+x.date.slice(5,7)}月</span><b>${+x.date.slice(8)}</b></div><div style="flex:1;min-width:0"><div class="t1">${x.mood?MOODS[x.mood-1]+' ':''}${db.habits.filter(h=>x.habits?.[h.id]).map(h=>h.icon).join(' ')}${+x.hours?` <span class="t2">· ${x.hours} 小时</span>`:''}${x.tags?` <span class="t2">· ${esc(x.tags)}</span>`:''}</div><div class="t2" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.text||'（没有写文字）')}</div></div></div>`).join(''):'<div class="empty">还没有记录。从今天开始，每天花一分钟写几句。</div>'}
  </div></div></div>
 <div class="card sec" style="margin-top:16px"><h3>⚙️ 打卡项目<span class="m">按自己的节奏来</span></h3><div class="quick" style="align-items:center">${db.habits.map(h=>`<span class="tag" style="font-size:13px;padding:3px 10px">${h.icon} ${esc(h.name)} <a href="#" data-delhabit="${h.id}" title="删除" style="color:var(--muted)">✕</a></span>`).join('')}<input class="inp" id="newHabit" placeholder="＋ 新增打卡项，回车添加" style="width:210px;padding:4px 10px"></div></div>`;
}
function vSkills(){
 const L=db.skills;
 if(!L.length)return `<div class="card hero"><div style="font-size:44px">🌱</div><h2>建立你的能力树</h2><p>把会的技术、要补的知识点列出来，给自己打分、定目标，看着它一点点长起来。</p><button class="btn primary" data-act="addskill">＋ 添加技能</button>&nbsp;&nbsp;<button class="btn" data-act="skillpreset">一键添加后端常用技能</button></div>`;
 const cats=[...new Set(L.map(x=>x.cat||'其他'))],tot=L.reduce((s,x)=>s+(+x.target||0),0),cur=L.reduce((s,x)=>s+Math.min(+x.level||0,+x.target||0),0);
 const jd=x=>{const k=x.name.toLowerCase();return k?db.apps.filter(a=>(a.notes+' '+a.role).toLowerCase().includes(k)).length:0;};
 const gap=L.filter(x=>(+x.target||0)>(+x.level||0)).sort((a,b)=>(jd(b)-jd(a))||((b.target-b.level)-(a.target-a.level))).slice(0,3);
 return `<div class="card goal"><div><div class="t1">整体达成度</div><div class="t2">当前水平 / 目标水平</div></div><div class="bar"><i style="width:${tot?cur/tot*100:0}%"></i></div><div class="big">${tot?Math.round(cur/tot*100):0}<span class="t2">%</span></div><button class="btn sm primary" data-act="addskill">＋ 添加技能</button></div>
 ${gap.length?`<div class="alert info">💡 建议优先补：${gap.map(x=>`<b>${esc(x.name)}</b>（${LVN[x.level||0]} → ${LVN[x.target]}${jd(x)?`，${jd(x)} 个岗位提到`:''}）`).join('、')}</div>`:''}
 <p class="t2" style="margin:8px 0 14px">点圆点直接调水平，带金圈的是目标。「岗位提及」= 你投递的岗位名和备注里出现这个技能的次数，把 JD 要点贴进备注就能统计。</p>
 ${cats.map(c=>`<div class="daygrp"><h5>${esc(c)}</h5><div class="skgrid">${L.filter(x=>(x.cat||'其他')===c).map(x=>{const n=jd(x);return `<div class="card sk" data-skill="${x.id}"><div style="display:flex;align-items:center;gap:8px"><span class="t1" style="flex:1">${esc(x.name)}</span>${n?`<span class="pill" style="background:var(--accent-soft);color:var(--accent)">岗位提及 ${n}</span>`:''}</div>
  <div class="lv">${[1,2,3,4,5].map(i=>`<i data-lv="${x.id}|${i}" class="${i<=(x.level||0)?'on':''} ${i===+x.target?'tg':''}" title="${LVN[i]}${i===+x.target?'（目标）':''}"></i>`).join('')}</div>
  <div class="t2">${LVN[x.level||0]}${x.target?' → 目标 '+LVN[x.target]:''}</div>${x.notes?`<div class="t2 clamp">${esc(x.notes)}</div>`:''}
  <div class="quick">${ext(safeUrl(x.link),'📎 我的资料','tag')}${ext(`https://www.nowcoder.com/search/all?query=${enc(x.name+' 面试题')}`,'牛客面试题','tag')}${ext(`https://www.bing.com/search?q=${enc(x.name+' 学习路线')}`,'学习路线','tag')}</div></div>`;}).join('')}</div></div>`).join('')}`;
}
function tplFill(body,a){const P=db.settings.profile||{};const sk=db.skills.filter(x=>+x.level>=3).sort((x,y)=>y.level-x.level).slice(0,3).map(x=>x.name);
 const jd=a?kwFind(a.notes||'').filter(k=>skillFor(k)&&+skillFor(k).level>=3).slice(0,3):[];
 const M={'{公司}':a?.company||'贵公司','{岗位}':a?.role||'这个','{联系人}':a?.contact||'','{我}':P.name||'','{投递日期}':a?.appliedAt?`${+a.appliedAt.slice(5,7)}月${+a.appliedAt.slice(8,10)}日`:'前几天','{技能}':(jd.length?jd:sk).join('、')||'相关技术'};
 return body.replace(/\{(公司|岗位|联系人|我|投递日期|技能)\}/g,m=>M[m]).replace(/我是，/g,'');}
function copyText(t,msg){navigator.clipboard.writeText(t).then(()=>toast(msg||'已复制'),()=>toast('复制失败，请手动选择文本复制'));}
function vTpl(){
 return `<div class="tools"><span class="t2">可用变量：${TPL_VARS.map(v=>`<code>${v}</code>`).join(' ')}　在投递详情里点模板，会自动填好那家公司的信息</span><span style="flex:1"></span><button class="btn primary sm" data-act="addtpl">＋ 新模板</button></div>
 <div class="skgrid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">${db.tpls.map(t=>`<div class="card sk tplc"><div style="display:flex;align-items:center;gap:8px"><div class="t1" style="flex:1">${esc(t.title)}</div><button class="btn sm ghost" data-tpledit="${t.id}">编辑</button><button class="btn sm" data-tplcopy="${t.id}">📋 复制</button></div><div class="t2 tplb">${esc(t.body).replace(/\{(公司|岗位|联系人|我|投递日期|技能)\}/g,'<mark>{$1}</mark>')}</div></div>`).join('')}</div>
 ${db.tpls.length?'':'<div class="card empty">还没有模板。<a href="#" data-act="resettpl">恢复默认模板</a></div>'}`;
}
function editTpl(x){const isNew=!x;x=x||{id:uid(),title:'',body:''};
 openForm(isNew?'新话术模板':'编辑话术模板',[['title','名称 *','text','',true],['body','内容（可用 '+TPL_VARS.join(' ')+'）','textarea','',true]],x,
  o=>{if(!o.title||!o.body){toast('名称和内容都要填');return false;}if(isNew)db.tpls.push(o);else Object.assign(x,o);},isNew?null:()=>delWithUndo(db.tpls,x,`模板「${x.title}」`));
 setTimeout(()=>{const t=document.querySelector('[data-ff="body"]');if(t)t.rows=7;},40);}
function toCSV(){const H=['公司','岗位','状态','城市','薪资','渠道','投递日期','投递截止','优先级','联系人','简历','岗位链接','下一步','备注'];
 const q=v=>{v=String(v??'');return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
 const rows=db.apps.map(a=>{const ne=nextEvent(a);return [a.company,a.role,SM[a.status]?.n||a.status,a.city,a.salary,a.channel,a.appliedAt,a.due,PRI[a.priority]?.[0]||'',a.contact,a.resume,a.link,ne?`${ne.at.replace('T',' ')} ${ne.title||EV[ne.type]}`:'',a.notes];});
 return '﻿'+[H,...rows].map(r=>r.map(q).join(',')).join('\r\n');}

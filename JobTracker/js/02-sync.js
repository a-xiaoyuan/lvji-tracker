// 履迹 · 自动备份到文件、如页简历备份、页面状态
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 文件自动备份 ========== */
let TOKEN=localStorage.getItem('jt_token')||'';
let START_VIEW='';
(()=>{const h=location.hash,m=h.match(/k=([0-9a-f]{16,})/),v=h.match(/v=(\w+)/);if(m){TOKEN=m[1];localStorage.setItem('jt_token',TOKEN);}if(v)START_VIEW=v[1];if(h)history.replaceState(null,'',location.pathname);})();
const sync={state:TOKEN?'wait':'off',folder:'',at:0};
// SYNC_BASE：本窗口最后一次和文件对上时，文件的版本号。保存时带上它，文件在这之后被别的窗口改过，服务会拒绝（409）。
let SYNC_BASE=0;
async function pull(){
 if(!TOKEN){sync.state='off';return renderSync();}
 try{const r=await fetch(API,{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)throw r.status;const j=await r.json();sync.folder=j.folder||sync.folder;
  if(j.data&&Array.isArray(j.data.apps)&&(j.savedAt||0)>(db.savedAt||0)){db=normalize(j.data);db.savedAt=j.savedAt;SYNC_BASE=j.savedAt||0;if(db._cleaned){delete db._cleaned;persist();}localStorage.setItem(KEY,JSON.stringify(db));applyTheme();render();if(openId)renderDrawer();toast('已从备份文件载入最新数据');}
  else if((db.savedAt||0)>(j.savedAt||0)||(!j.data&&db.apps.length)){if(!SYNC_BASE)SYNC_BASE=j.savedAt||0;await push();}
  else SYNC_BASE=j.savedAt||0;
  sync.state='ok';sync.at=Date.now();}catch{sync.state='err';}
 renderSync();
}
let pushT;function schedulePush(){if(!TOKEN)return;clearTimeout(pushT);pushT=setTimeout(push,600);}
async function push(retry){
 if(!TOKEN)return;clearTimeout(pushT);
 try{const sa=db.savedAt||Date.now();const r=await fetch(API,{method:'PUT',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify({savedAt:sa,base:SYNC_BASE,data:db})});
  if(r.status===409&&!retry){ // 另一个窗口刚存过：合并两边，再存一次
   const j=await r.json();db=normalize(mergeDb(j.data,db));db.savedAt=Math.max(Date.now(),(j.savedAt||0)+1);SYNC_BASE=j.savedAt||0;
   localStorage.setItem(KEY,JSON.stringify(db));applyTheme();render();if(openId)renderDrawer();
   toast('另一个履迹窗口也改了数据，已经自动合并两边的修改');return push(true);}
  if(!r.ok)throw 0;const j=await r.json();SYNC_BASE=sa;sync.state='ok';sync.folder=j.folder||sync.folder;sync.at=Date.now();}
 catch{sync.state='err';}renderSync();
}
function renderSync(){
 const el=document.getElementById('sync');const [c,t]={ok:['#4b4852',`已自动备份到文件<br><span style="font-size:11px">文档\\求职进度</span>`],wait:['#787e8a','正在连接备份服务…'],err:['#ff2d87','备份服务未连接<br><span style="font-size:11px">数据仍保存在本应用里</span>'],off:['#c9ced6','仅保存在本应用里<br><span style="font-size:11px">从桌面「履迹」打开可自动备份</span>']}[sync.state];
 el.innerHTML=`<span class="s" style="background:${c}"></span><span>${t}</span>`;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&saveT)flushSave();});
addEventListener('pagehide',()=>{if(saveT)flushSave();if(pushT&&TOKEN){const body=JSON.stringify({savedAt:db.savedAt,base:SYNC_BASE,data:db});if(body.length<60000)fetch(API,{method:'PUT',keepalive:true,headers:{'content-type':'application/json','x-token':TOKEN},body});}});

/* ========== 如页简历备份 ==========
   如页把简历存在 localStorage（ruye:documents），这里定时把它同步到 文档\求职进度\ruye-resumes.json；
   本地被清掉时（换电脑、清浏览器数据）自动从文件恢复。 */
const RK_DOCS='ruye:documents',RK_CUR='ruye:currentId',RAPI='http://127.0.0.1:47321/api/ruye';
let ruyeSent=localStorage.getItem('jt_ruye_sent')||'';
function ruyeSig(t){let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return t.length+':'+h;}
async function ruyePush(keep){
 if(!TOKEN)return;const docs=localStorage.getItem(RK_DOCS);if(!docs)return;
 const sig=ruyeSig(docs+'|'+(localStorage.getItem(RK_CUR)||''));if(sig===ruyeSent)return;
 const body=JSON.stringify({savedAt:Date.now(),docs,current:localStorage.getItem(RK_CUR)||''});
 if(keep){if(body.length<60000)fetch(RAPI,{method:'PUT',keepalive:true,headers:{'content-type':'application/json','x-token':TOKEN},body});return;}
 try{const r=await fetch(RAPI,{method:'PUT',headers:{'content-type':'application/json','x-token':TOKEN},body});if(r.ok){ruyeSent=sig;localStorage.setItem('jt_ruye_sent',sig);}}catch{}
}
const ruyeRestore=(async()=>{
 if(!TOKEN)return;
 let docs=null;try{docs=JSON.parse(localStorage.getItem(RK_DOCS)||'null');}catch{}
 if(Array.isArray(docs)&&docs.length)return;
 try{const r=await fetch(RAPI,{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)return;const j=await r.json();
  if(typeof j.docs!=='string')return;const arr=JSON.parse(j.docs);if(!Array.isArray(arr)||!arr.length)return;
  localStorage.setItem(RK_DOCS,j.docs);if(j.current)localStorage.setItem(RK_CUR,j.current);
  ruyeSent=ruyeSig(j.docs+'|'+(j.current||''));localStorage.setItem('jt_ruye_sent',ruyeSent);
  setTimeout(()=>toast(`已从备份文件恢复 ${arr.length} 份简历`),800);
 }catch{}
})();
setInterval(()=>ruyePush(),20000);
addEventListener('storage',e=>{if(e.key===RK_DOCS){clearTimeout(ruyePush.t);ruyePush.t=setTimeout(ruyePush,3000);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)ruyePush(true);});

/* ========== 状态 ========== */
let view='dash',openId=null,F={q:'',status:'',channel:'',sort:'updated'},qSearch='',qFilter='all',calMode='list',calMonth=new Date();calMonth.setDate(1);
const ICON={
 dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"/>',
 board:'<path d="M4 4h5v16H4zM10 4h5v10h-5zM16 4h4v13h-4z"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 offer:'<path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z"/>',
 resume:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
 review:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>',
 journal:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
 skills:'<path d="M12 22V12M12 12l-5-5M12 12l5-5M7 7V3M17 7V3M7 7H3M17 7h4"/>',
 agent:'<path d="M12 2a10 10 0 1010 10"/><path d="M12 12l6-6"/><path d="M22 4v6h-6"/>',
 tpl:'<path d="M4 4h16v12H8l-4 4z"/><path d="M8 8h8M8 12h5"/>',
 stories:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8M8 13h5"/>',
 people:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/>',
 bank:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5zM4 19.5A2.5 2.5 0 006.5 22H20v-5"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>'};
const VIEWS=[['dash','概览'],['board','看板'],['list','全部投递'],['cal','面试日程'],['offer','Offer 对比'],['bank','面试题库'],['tpl','话术模板'],['resume','我的简历'],['journal','成长日记'],['review','回顾与历程'],['skills','能力树'],['stories','故事库'],['people','人脉'],['agent','Agent 额度'],['settings','设置与备份']];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;


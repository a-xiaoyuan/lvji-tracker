// 履迹 · 示例数据与启动
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 示例数据 ========== */
function loadSample(){
 const D=n=>dstr(new Date(Date.now()+n*864e5)),T=(n,h)=>`${D(n)}T${pad(h)}:00`;
 const ev=(type,title,at,done,extra={})=>Object.assign({id:uid(),type,title,at,done,rating:0,questions:'',review:'',place:''},extra);
 const S=p=>{const a=newApp(Object.assign({sample:true},p));logStatus(a,'',a.status);return a;};
 const pick=a=>a[Math.random()*a.length|0];
 db.apps.push(
  S({company:'星河科技（示例）',role:'后端开发工程师',city:'杭州',salary:'25-35K·15薪',channel:'内推',status:'offer',priority:1,appliedAt:D(-30),resume:'Java 后端 v3',
   events:[ev('test','在线笔试',T(-25,19),true,{rating:4,questions:'LRU 缓存实现\n二叉树的层序遍历'}),ev('interview','一面',T(-20,14),true,{rating:4,questions:'Redis 持久化 RDB 和 AOF 的区别\nMySQL 索引为什么用 B+ 树\n讲一个你做过最有挑战的项目',review:'项目讲得不错，索引下推没答上来，要复习'}),ev('interview','二面',T(-14,15),true,{rating:3,questions:'设计一个短链接系统\n消息队列如何保证不丢消息'}),ev('interview','HR 面',T(-8,11),true,{rating:5})],
   offer:{base:28000,months:15,bonus:30000,stock:0,other:12000,wlb:3,growth:4,deadline:D(2)}}),
  S({company:'蓝鲸云（示例）',role:'Go 开发工程师',city:'上海',salary:'30-40K·14薪',channel:'Boss直聘',status:'offer',priority:1,appliedAt:D(-26),resume:'Go 后端 v1',
   events:[ev('interview','一面',T(-18,10),true,{rating:4,questions:'goroutine 调度的 GMP 模型\nchannel 的底层结构'}),ev('interview','二面',T(-11,16),true,{rating:4}),ev('offer','谈薪',T(-3,17),true)],
   offer:{base:33000,months:14,bonus:0,stock:40000,other:6000,wlb:2,growth:4,deadline:D(6)}}),
  S({company:'青柠数据（示例）',role:'数据平台开发',city:'北京',salary:'25-32K',channel:'官网',status:'interview',priority:2,appliedAt:D(-12),
   events:[ev('interview','一面',T(-5,15),true,{rating:3,questions:'Kafka 分区和消费者组\nSpark 宽依赖与窄依赖\n两数之和 https://leetcode.cn/problems/two-sum/'}),ev('interview','二面',T(1,14),false,{place:'腾讯会议'})]}),
  S({company:'北辰智能（示例）',role:'大模型应用开发',city:'深圳',salary:'30-45K',channel:'牛客',status:'test',priority:1,appliedAt:D(-6),events:[ev('test','笔试',T(0,19),false)]}),
  S({company:'远山网络（示例）',role:'Java 开发',city:'成都',salary:'18-25K',channel:'拉勾',status:'applied',priority:3,appliedAt:D(-10)}),
  S({company:'橙子电商（示例）',role:'后端开发',city:'广州',salary:'20-28K',channel:'Boss直聘',status:'rejected',priority:2,appliedAt:D(-22),events:[ev('interview','一面',T(-16,11),true,{rating:2,questions:'手写快速排序\nTCP 三次握手为什么不是两次',review:'算法题没写出来，要多刷题'})]}),
  S({company:'云杉游戏（示例）',role:'服务端开发',city:'杭州',salary:'25-35K',channel:'猎聘',status:'interview',priority:2,appliedAt:D(-9),events:[ev('interview','一面',T(3,10),false)]}),
  S({company:'晨光教育（示例）',role:'全栈工程师',city:'南京',channel:'内推',status:'wish',priority:2,appliedAt:''}));
 for(let i=0;i<6;i++)db.apps.push(S({company:`示例公司 ${String.fromCharCode(65+i)}`,role:'后端开发',city:pick(['杭州','上海','北京']),channel:pick(CH),status:pick(['applied','applied','rejected','dropped']),priority:3,appliedAt:D(-Math.floor(Math.random()*50)-3)}));
 persist();render();toast('已加载示例数据，可在概览或设置里一键清除');
}

/* ========== 启动 ========== */
db=(()=>{const raw=localStorage.getItem(KEY);if(!raw)return normalize({});try{return normalize(JSON.parse(raw));}catch(e){console.error(e);localStorage.setItem(KEY+'_broken_'+Date.now(),raw);return normalize({});}})();
if(db._cleaned){delete db._cleaned;db.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(db));}
if(START_VIEW&&VIEWS.some(v=>v[0]===START_VIEW))view=START_VIEW;
applyTheme();renderSync();render();pull();
setInterval(checkReminders,30000);setTimeout(checkReminders,1500);setTimeout(()=>{try{autoScanSubs();}catch(_){}},6000);setInterval(rvPrompt,60000);setTimeout(rvPrompt,4000);
renderFocus();setInterval(tickFocus,1000);
document.addEventListener('paste',e=>{const t=e.target;if(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable||document.getElementById('modal').classList.contains('on')||openId||view==='resume')return;
 const txt=(e.clipboardData?.getData('text')||'').trim();if(!txt)return;e.preventDefault();const lines=txt.split(/\r?\n/).filter(l=>l.trim());
 if(looksInvite(txt))return openInvite(txt);
 if(lines.length>1){bulkText=txt;openAdd('applied','bulk');return toast(`识别到 ${lines.length} 行，已放进批量导入`);}
 if(/^https?:\/\//i.test(txt)){openAdd('applied','one',{link:txt,channel:/zhipin/.test(txt)?'Boss直聘':/lagou/.test(txt)?'拉勾':/liepin/.test(txt)?'猎聘':/nowcoder/.test(txt)?'牛客':'官网'});return toast('链接已填好，补上公司和岗位就行');}
 const o=parseLine(txt);openAdd(o.status||'applied','one',o);});
const INBOX='http://127.0.0.1:47321/api/inbox';let inboxBusy=false;
async function pullInbox(){if(!TOKEN||inboxBusy)return;inboxBusy=true;
 try{const r=await fetch(INBOX,{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)return;const items=(await r.json()).items||[];if(!items.length)return;
  const have=new Set(db.apps.map(a=>a.inboxId).filter(Boolean)),fresh=items.filter(it=>!have.has(it.id));
  const added=[],upd=[],chats=[];
  for(const it of fresh){if(it.kind==='chat'){chats.push(it);continue;}const wish=it.status==='wish';
   const ex=it.company&&db.apps.find(a=>sameCo(a.company,it.company)&&(!it.role||!a.role||coKey(a.role)===coKey(it.role)));
   if(ex){ex.inboxId=it.id;for(const k of ['link','city','salary'])if(!ex[k]&&it[k])ex[k]=it[k];if(it.jd&&!String(ex.notes||'').includes(it.jd.slice(0,40)))ex.notes=[ex.notes,it.jd].filter(Boolean).join('\n\n');if(it.hr&&!ex.contact)ex.contact=it.hr;
    if(!wish&&ex.status==='wish'){ex.appliedAt=dstr(new Date(it.at||Date.now()));setStatus(ex,'applied',true);}touch(ex);upd.push(ex.company);continue;}
   const a=newApp({inboxId:it.id,company:it.company||'未命名公司',role:it.role||'',city:it.city||'',salary:it.salary||'',channel:CH.includes(it.channel)?it.channel:'其他',status:wish?'wish':'applied',appliedAt:wish?'':dstr(new Date(it.at||Date.now())),link:it.link||'',contact:it.hr||'',notes:it.jd||''});logStatus(a,'',a.status);db.apps.push(a);added.push(a.company);}
  let inv=null;const chatMsg=[];
  for(const it of chats){const t=String(it.text||'').trim();if(!t)continue;
   let a=it.company?(db.apps.find(x=>sameCo(x.company,it.company)&&it.role&&coKey(x.role)===coKey(it.role))||db.apps.find(x=>sameCo(x.company,it.company)&&!['rejected','dropped'].includes(x.status))||db.apps.find(x=>sameCo(x.company,it.company))):null;
   if(!a&&it.company){a=newApp({inboxId:it.id,company:it.company,role:it.role||'',channel:'Boss直聘',status:'applied',appliedAt:today(),contact:it.hr||''});logStatus(a,'',a.status);db.apps.push(a);added.push(a.company);}
   if(a){a.notes=[a.notes,`【Boss 聊天 · ${nowLocal().replace('T',' ')}${it.hr?' · '+it.hr:''}】\n${t.slice(0,3000)}`].filter(Boolean).join('\n\n');if(it.hr&&!a.contact)a.contact=it.hr;if(a.status==='wish')setStatus(a,'applied',true);touch(a);}
   if(looksInvite(t))inv={t,aid:a?.id||''};else chatMsg.push(a);}
  if(fresh.length){persist();flushSave();render();
   const msg=[added.length&&`收进 ${added.length} 条：${added.slice(0,5).join('、')}${added.length>5?' 等':''}`,upd.length&&`更新 ${upd.length} 条：${upd.slice(0,3).join('、')}`,chatMsg.length&&`${chatMsg.filter(Boolean).map(a=>a.company).join('、')||'一段'} 聊天已存进备注`].filter(Boolean).join('；');
   if(msg)toast((fresh.every(x=>x.auto)?'🔗 自动记录 · ':'📥 ')+msg,chatMsg[0]?['查看',()=>openDrawer(chatMsg[0].id)]:null,6000);
   if(inv){const go=()=>{openInvite(inv.t,inv.aid);setTimeout(invGo,60);};if(!document.getElementById('modal').classList.contains('on'))go();else toast('📥 收到一段像面试邀请的 Boss 聊天',['识别并建日程',go],20000);}}
  await fetch(INBOX,{method:'DELETE',headers:{'x-token':TOKEN,'content-type':'application/json'},body:JSON.stringify({ids:items.map(x=>x.id)})});
 }catch{}finally{inboxBusy=false;}}
setTimeout(pullInbox,1200);setInterval(()=>{if(!document.hidden)pullInbox();},5000);addEventListener('focus',pullInbox);
setInterval(()=>{if(sync.state!=='ok'&&TOKEN)pull();},60000);
(()=>{const n=allEvents().filter(({e})=>!e.done&&e.at&&e.at.slice(0,10)===today());if(n.length)setTimeout(()=>toast(`📅 今天有 ${n.length} 项安排：${n.map(x=>x.a.company+' '+(x.e.title||EV[x.e.type])).join('、')}`),500);})();

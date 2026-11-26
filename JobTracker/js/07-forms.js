// 履迹 · 表单弹窗、详情抽屉、新增与搜索、日历与提醒、提示条
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
/* ========== 通用表单弹窗 ========== */
let FORM=null;
function openForm(title,fields,obj,onSave,onDel){
 FORM={fields,obj,onSave,onDel};const b=document.getElementById('mbox');b.className='card mbox';
 b.innerHTML=`<h3>${esc(title)}</h3><div class="fg" style="max-height:62vh;overflow:auto;padding:2px">${fields.map(([k,l,t,o,full])=>{const v=obj[k]??'';let inp;
  if(t==='textarea')inp=`<textarea class="inp" data-ff="${k}" rows="3" placeholder="${esc(o||'')}">${esc(v)}</textarea>`;
  else if(t==='select')inp=`<select class="inp" data-ff="${k}">${o.map(x=>{const [val,lab]=Array.isArray(x)?x:[x,x];return `<option value="${esc(val)}" ${String(v)===String(val)?'selected':''}>${esc(lab)}</option>`;}).join('')}</select>`;
  else if(t==='checks')inp=`<div class="quick">${o.map(x=>{const on=(v||[]).includes(x);return `<label class="hb ${on?'on':''}"><input type="checkbox" data-ffc="${k}" value="${esc(x)}" ${on?'checked':''} hidden>${esc(x)}</label>`;}).join('')}</div>`;
  else inp=`<input class="inp" type="${t||'text'}" data-ff="${k}" value="${esc(v)}" ${t==='text'&&o?`list="${o}"`:''}>`;
  return `<div class="f ${full?'full':''}"><label>${l}</label>${inp}</div>`;}).join('')}</div>
  <div class="mfoot">${onDel?'<button class="btn danger" data-act="fdel" style="margin-right:auto">删除</button>':''}<button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="fsave">保存</button></div>`;
 document.getElementById('modal').classList.add('on');setTimeout(()=>b.querySelector('.inp')?.focus(),30);
}
function formSave(){if(!FORM)return;const o={...FORM.obj};for(const [k,,t] of FORM.fields){if(t==='checks')o[k]=[...document.querySelectorAll(`[data-ffc="${k}"]:checked`)].map(x=>x.value);else{const el=document.querySelector(`[data-ff="${k}"]`);o[k]=t==='select'&&/^\d+$/.test(el.value)?+el.value:el.value.trim();}}
 if(FORM.onSave(o)===false)return;persist();closeModal();render();}
function delWithUndo(list,item,label){const i=list.indexOf(item);if(i<0)return;list.splice(i,1);toast(`已删除${label}`,['撤销',()=>{list.splice(i,0,item);persist();render();}]);}
function editSkill(x){const isNew=!x;x=x||{id:uid(),name:'',cat:'',level:1,target:4,notes:'',link:''};
 openForm(isNew?'添加技能':'编辑技能',[['name','技能名称 *','text'],['cat','分类','text','skcats'],['level','当前水平','select',LV],['target','目标水平','select',LV],['link','学习资料链接（笔记、课程、文档）','text','',true],['notes','笔记 / 还要补的点','textarea','如：AOF 重写机制还不熟',true]],x,
  o=>{if(!o.name){toast('请填写技能名称');return false;}if(isNew)db.skills.push(o);else Object.assign(x,o);},isNew?null:()=>delWithUndo(db.skills,x,`技能「${x.name}」`));}
function editStory(x,q){const isNew=!x;x=x||{id:uid(),title:q||'',s:'',t:'',a:'',r:'',qs:q?[q]:[]};
 openForm(isNew?'新故事（STAR）':'编辑故事',[['title','标题 *','text','',true],['s','S 情境：当时是什么背景','textarea','项目背景、团队规模、遇到的情况',true],['t','T 任务：你要解决什么问题','textarea','你的职责和目标',true],['a','A 行动：你具体做了什么','textarea','重点写「我」做了什么、为什么这样做',true],['r','R 结果：带来了什么结果','textarea','尽量量化：性能提升 X%、节省 X 小时……',true],['qs','这个故事能回答哪些问题','checks',BQ,true]],x,
  o=>{if(!o.title){toast('请填写标题');return false;}if(isNew)db.stories.push(o);else Object.assign(x,o);},isNew?null:()=>delWithUndo(db.stories,x,`故事「${x.title}」`));}
function editPerson(x){const isNew=!x;x=x||{id:uid(),name:'',rel:'内推人',company:'',title:'',contact:'',lastAt:today(),nextAt:'',notes:''};
 openForm(isNew?'添加联系人':'编辑联系人',[['name','姓名 / 称呼 *'],['rel','关系','select',REL],['company','公司'],['title','职位'],['contact','联系方式（微信 / 电话 / 邮箱）','text','',true],['lastAt','上次联系','date'],['nextAt','下次跟进日期','date'],['notes','备注（怎么认识的、聊了什么、答应帮什么忙）','textarea','',true]],x,
  o=>{if(!o.name){toast('请填写姓名');return false;}if(isNew)db.people.push(o);else Object.assign(x,o);},isNew?null:()=>delWithUndo(db.people,x,`联系人「${x.name}」`));}
function editMe(){const P=db.settings.profile||{};
 openForm('关于我',[['name','名字 / 昵称'],['target','目标岗位','text'],['cities','意向城市'],['salary','期望薪资'],['startDate','求职开始日期','date'],['motto','给自己的一句话','text','',true],['phone','手机号（网申填表用）'],['email','邮箱（网申填表用）'],['school','学校'],['major','专业'],['degree','学历','select',['本科','硕士','博士','大专','其他']],['gradYear','毕业年份','text','如：2028'],['gpa','成绩 / GPA','text','',true],['english','英语水平','text','如：CET-6 520 分',true]],{...P,startDate:db.settings.startDate},
  o=>{db.settings.startDate=o.startDate;delete o.startDate;db.settings.profile=o;});}

/* ========== 详情抽屉 ========== */
function openDrawer(id){openId=id;renderDrawer();document.getElementById('drawer').classList.add('on');document.getElementById('mask').classList.add('on');}
function closeDrawer(){openId=null;document.getElementById('drawer').classList.remove('on');document.getElementById('mask').classList.remove('on');render();}
function fld(label,f,val,type='text',extra='',ph=''){return `<div class="f ${extra}"><label>${label}</label>${type==='textarea'?`<textarea class="inp" data-f="${f}" rows="3" placeholder="${ph}">${esc(val)}</textarea>`:`<input class="inp" type="${type}" data-f="${f}" value="${esc(val)}" placeholder="${ph}">`}</div>`;}
function urlFld(label,f,val,btn){const u=safeUrl(val);return `<div class="f"><label>${label}</label><div style="display:flex;gap:6px"><input class="inp" data-f="${f}" value="${esc(val)}" placeholder="粘贴网址" style="flex:1">${u?ext(u,btn,'btn'):''}</div></div>`;}
function renderDrawer(){
 const a=appById(openId);if(!a)return closeDrawer();
 const evs=a.events.slice().sort((x,y)=>(y.at||'').localeCompare(x.at||''));
 const o=a.offer;
 document.getElementById('drawer').innerHTML=`
 <div class="dh"><div style="flex:1;min-width:0"><h2>${esc(a.company)||'未命名公司'}${a.company?` <button class="btn sm ghost" data-act="company" data-c="${esc(a.company)}" title="这家公司的全部投递、面试、题目和人脉" style="vertical-align:middle">🏢 档案</button>`:''}</h2><div class="t2">${esc(a.role)}${a.appliedAt?' · 投递于 '+a.appliedAt+'（'+Math.max(0,dayDiff(today(),a.appliedAt))+' 天前）':''}</div>
  <div class="statusbar">${ST.map(s=>`<button data-setst="${s.k}" class="${a.status===s.k?'on':''}" style="${a.status===s.k?`background:${s.c}`:''}">${s.n}</button>`).join('')}</div></div>
  <button class="btn ghost" data-act="close" title="关闭 (Esc)">✕</button></div>
 <div class="db">
  ${a.company?`<div class="quick" style="margin-bottom:16px">${COMPANY_LINKS.map(([n,ic,f])=>ext(f(a),ic+' '+n,'btn sm')).join('')}<button class="btn sm" data-act="intel" data-a="${a.id}" title="联网搜索公司概况、近期动态、员工评价和面经">🔎 AI 速查</button></div>`:''}${intelHtml(a)}
  <div class="fg">
   ${fld('公司','company',a.company)}${fld('岗位','role',a.role)}
   ${fld('城市','city',a.city)}${fld('薪资范围','salary',a.salary)}
   ${urlFld('岗位链接','link',a.link,'去投递 ↗')}${urlFld('公司官网','site',a.site,'官网 ↗')}
   <div class="f"><label>投递渠道</label><select class="inp" data-f="channel">${CH.map(c=>`<option ${a.channel===c?'selected':''}>${c}</option>`).join('')}</select></div>
   ${fld('投递日期','appliedAt',a.appliedAt,'date')}
   ${a.status==='wish'||a.due?fld('投递截止日期（网申 / 测评截止）','due',a.due,'date'):''}
   <div class="f"><label>优先级</label><select class="inp" data-f="priority">${[1,2,3].map(p=>`<option value="${p}" ${+a.priority===p?'selected':''}>${PRI[p][0]}（${['最想去','还不错','保底'][p-1]}）</option>`).join('')}</select></div>
   ${fld('联系人 / HR','contact',a.contact)}
   <div class="f full"><label>投递用的简历</label><div style="display:flex;gap:6px"><input class="inp" data-f="resume" value="${esc(a.resume)}" placeholder="如：Java 后端 v3（如页里的简历名）" list="ruyeTitles" style="flex:1"><datalist id="ruyeTitles">${ruyeDocs().map(d=>`<option value="${esc(ruyeTitle(d))}">`).join('')}</datalist><button class="btn" data-view="resume">✎ 去编辑简历</button></div></div>
   ${fld('备注（JD 要点、公司情况、内推人等）','notes',a.notes,'textarea','full')}
   ${kwFind(a.notes||'').length?`<div class="f full" id="drawerJD">${jdHtml(a.notes,a)}</div>`:''}${(a.notes||'').trim().length>30?`<div class="f full"><button class="btn sm" data-act="jdadvice" data-a="${a.id}">✨ AI 按这个 JD 看简历${a.aiResume?'（看上次的结果）':''}</button> <button class="btn sm" data-act="tailorgo" data-a="${a.id}">🎯 定制简历要点${a.tailor?'（看上次的）':''}</button> <button class="btn sm" data-act="tailorbind" data-a="${a.id}" title="把当前简历复制一份「公司 定制版」，绑定到这条投递，在如页里单独改这一版">📎 存为这家专属版</button></div>`:''}${a.tailor?`<div class="f full"><label>🎯 这家的定制要点（${esc((a.tailor.at||'').slice(0,10))}）</label><div class="t2" style="white-space:pre-wrap;max-height:180px;overflow:auto">${esc(a.tailor.text)}</div></div>`:''}
  </div>
  ${a.status==='rejected'?`<div class="dsec"><h4>🔍 未通过记录<span class="sp"></span><button class="btn sm" data-act="failedit" data-a="${a.id}">${a.fail?'修改':'记一下卡在哪'}</button></h4>${a.fail?`<div class="t2">卡在 <b>${esc(a.fail.stage)}</b>${a.fail.reasons?.length?' · '+a.fail.reasons.map(esc).join('、'):''}${a.fail.note?'<br>'+esc(a.fail.note):''}</div>`:'<div class="t2">还没记原因。记几次，复盘页就能看出总卡在哪。</div>'}</div>`:''}
  <div class="dsec"><h4>💬 常用话术<span class="sp"></span><button class="btn sm" data-act="aimsg" data-a="${a.id}">✨ AI 写一条</button><a href="#" data-view="tpl" class="t2">管理模板 →</a></h4><div class="quick">${db.tpls.map(t=>`<button class="btn sm" data-tplcopy="${t.id}" title="填好 ${esc(a.company||'公司')} 的信息后复制">📋 ${esc(t.title)}</button>`).join('')}</div></div>
  <div class="dsec"><h4>面试与进展<span class="sp"></span><button class="btn sm" data-act="invite" data-a="${a.id}">📋 粘贴邀请</button> <button class="btn sm" data-act="mock" data-a="${a.id}">🎙 模拟面试</button> ${Object.entries(EV).filter(([k])=>k!=='note').map(([k,n])=>`<button class="btn sm" data-addev="${k}">＋ ${n}</button>`).join(' ')}</h4>
   ${evs.length?evs.map(e=>`<div class="evc"><div class="hd"><select class="inp" data-ev="${e.id}" data-ef="type" style="width:auto">${Object.entries(EV).map(([k,n])=>`<option value="${k}" ${e.type===k?'selected':''}>${n}</option>`).join('')}</select>
     <input class="inp" data-ev="${e.id}" data-ef="title" value="${esc(e.title)}" placeholder="如：一面 / 技术面 / 主管面" style="flex:1;min-width:0">
     <input class="inp" type="datetime-local" data-ev="${e.id}" data-ef="at" value="${esc(e.at)}" style="width:190px">
     <label class="t2" style="display:flex;align-items:center;gap:4px;white-space:nowrap"><input type="checkbox" class="chk" data-ev="${e.id}" data-ef="done" ${e.done?'checked':''}>完成</label>
     ${(e.type==='interview'||e.type==='test')&&!e.done?`<button class="btn sm" data-act="prep" data-a="${a.id}" data-e="${e.id}" title="面试备战卡">🎯 备战</button>`:''}${e.type==='interview'&&e.at&&e.at<nowLocal()?`<button class="btn sm" data-act="rvopen" data-a="${a.id}" data-e="${e.id}" title="3 步复盘：感觉、题目、薄弱点">📝 复盘</button>`:''}${e.type==='interview'&&e.at&&e.at.slice(0,10)<=today()?`<button class="btn sm" data-act="listen" data-a="${a.id}" data-e="${e.id}" title="粘贴面试文字稿或现场转写，AI 提取题目并复盘">🎙 转写</button>`:''}<button class="btn sm ghost danger" data-delev="${e.id}" title="删除">🗑</button></div>${(c=>c.length?`<div class="alert bad" style="margin:8px 0 0">⚠ 时间冲突：前后 90 分钟内还有 ${esc(c.join("、"))}，记得提前协调改期</div>`:"")(e.type==="note"?[]:clashes(e,a))}
    <div class="fg">
     <div class="f"><label>地点 / 会议链接</label><div style="display:flex;gap:6px"><input class="inp" data-ev="${e.id}" data-ef="place" value="${esc(e.place)}" style="flex:1">${/^https?:/.test(e.place||'')?ext(safeUrl(e.place),'进入','btn'):''}</div></div>
     <div class="f"><label>自我评分</label><div style="display:flex;align-items:center;gap:10px"><div class="stars">${[1,2,3,4,5].map(i=>`<button data-rate="${e.id}|${i}" class="${i<=(e.rating||0)?'on':''}">★</button>`).join('')}</div>${e.at?`<button class="btn sm ghost" data-ics="${e.id}" title="下载 .ics 文件导入日历">📅 加到日历</button>`:''}</div></div>
     <div class="f full"><label>被问到的问题（每行一题，可附原题链接，会自动进入题库）</label><textarea class="inp" data-ev="${e.id}" data-ef="questions" rows="3">${esc(e.questions)}</textarea></div>
     <div class="f full"><label>复盘：哪里答得好、哪里要补</label><textarea class="inp" data-ev="${e.id}" data-ef="review" rows="2">${esc(e.review)}</textarea></div>
    </div></div>`).join(''):'<div class="empty" style="border:1px dashed var(--line);border-radius:12px">还没有记录。收到笔试或面试通知后点上面的按钮添加。</div>'}
  </div>
  ${a.status==='offer'||annual(o)?`<div class="dsec"><h4>Offer 详情<span class="sp"></span><span class="t2">年包约 <b id="annual" style="color:var(--ok);font-size:15px">${fmtK(annual(o))}</b></span></h4><div class="fg">
   <div class="f"><label>月薪（元）</label><input class="inp" type="number" data-of="base" value="${esc(o.base)}"></div>
   <div class="f"><label>发几个月</label><input class="inp" type="number" data-of="months" value="${esc(o.months)}" placeholder="12"></div>
   <div class="f"><label>年终奖 / 签字费（元）</label><input class="inp" type="number" data-of="bonus" value="${esc(o.bonus)}"></div>
   <div class="f"><label>股票期权（年化，元）</label><input class="inp" type="number" data-of="stock" value="${esc(o.stock)}"></div>
   <div class="f"><label>其他补贴（年，元）</label><input class="inp" type="number" data-of="other" value="${esc(o.other)}"></div>
   <div class="f"><label>答复截止日期</label><input class="inp" type="date" data-of="deadline" value="${esc(o.deadline)}"></div>
   <div class="f"><label>成长空间（1-5）</label><input class="inp" type="range" min="1" max="5" data-of="growth" value="${o.growth||3}"></div>
   <div class="f"><label>工作生活平衡（1-5）</label><input class="inp" type="range" min="1" max="5" data-of="wlb" value="${o.wlb||3}"></div>
  </div></div>`:''}
  ${a.history.length?`<div class="dsec"><h4>进度记录</h4><div class="hist">${a.history.slice().reverse().map(h=>`<div>${esc(h.at)} · ${h.from?SM[h.from]?.n+' → ':''}<b style="color:var(--text)">${SM[h.to]?.n||''}</b></div>`).join('')}</div></div>`:''}
  <div class="dsec" style="display:flex;justify-content:space-between"><span class="t2">修改会自动保存</span><button class="btn sm danger" data-delapp="${a.id}">删除这条投递</button></div>
 </div>`;
}

/* ========== 弹窗：新增 / 搜索 ========== */
let addTab='one',addPre={},addSt='applied',bulkText='',bulkSt='applied';
function openAdd(st='applied',tab='one',pre={}){addTab=tab;addPre=pre||{};addSt=st||'applied';document.getElementById('modal').classList.add('on');renderAdd();}
function renderAdd(){const b=document.getElementById('mbox'),st=addSt;b.className='card mbox addbox';
 const head=`<div class="addh"><h3 style="margin:0">新增投递</h3><div class="seg">${[['one','✎ 单个'],['bulk','📋 批量粘贴'],['web','🌐 浏览器一键添加']].map(([k,n])=>`<button data-addtab="${k}" class="${addTab===k?'on':''}">${n}</button>`).join('')}</div></div>`;
 if(addTab==='bulk')return renderBulk(b,head);
 if(addTab==='web')return renderWeb(b,head);
 b.innerHTML=head+`<div class="fg">
  <div class="f"><label>公司 *</label><input class="inp" id="nCompany" placeholder="公司名称"></div>
  <div class="f"><label>岗位 *</label><input class="inp" id="nRole" placeholder="如：后端开发工程师"></div>
  <div class="f"><label>城市</label><input class="inp" id="nCity"></div>
  <div class="f"><label>薪资范围</label><input class="inp" id="nSalary" placeholder="如：20-30K·14薪"></div>
  <div class="f"><label>渠道</label><select class="inp" id="nCh">${CH.map(c=>`<option>${c}</option>`).join('')}</select></div>
  <div class="f"><label>当前进度</label><select class="inp" id="nSt">${ST.map(s=>`<option value="${s.k}" ${s.k===st?'selected':''}>${s.n}</option>`).join('')}</select></div>
  <div class="f"><label>投递日期</label><input class="inp" type="date" id="nDate" value="${today()}"></div>
  <div class="f"><label>优先级</label><select class="inp" id="nPri"><option value="1">高（最想去）</option><option value="2" selected>中</option><option value="3">低（保底）</option></select></div>
  <div class="f full"><label>岗位链接（可选，之后能一键打开去投递）</label><input class="inp" id="nLink" placeholder="https://"></div>
  <div class="f full"><label>岗位 JD（可选，粘贴后自动分析和你的技能匹配度，会存进备注）</label><textarea class="inp" id="nJD" rows="4" placeholder="把招聘要求粘贴到这里"></textarea><div id="jdBox"></div></div></div>
  <div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="msave">保存并打开详情</button></div>`;
 for(const [id,k] of [['nCompany','company'],['nRole','role'],['nCity','city'],['nSalary','salary'],['nLink','link'],['nJD','jd']])if(addPre[k])document.getElementById(id).value=addPre[k];
 if(CH.includes(addPre.channel))document.getElementById('nCh').value=addPre.channel;
 if(addPre.jd)document.getElementById('jdBox').innerHTML=jdHtml(addPre.jd);
 setTimeout(()=>document.getElementById(addPre.company?'nRole':'nCompany')?.focus(),30);
}
/* ---------- 批量粘贴 ---------- */
const CITY=['北京','上海','广州','深圳','杭州','南京','成都','武汉','西安','苏州','天津','重庆','长沙','厦门','合肥','郑州','青岛','济南','大连','珠海','东莞','佛山','宁波','无锡','福州','昆明','沈阳','哈尔滨','香港','新加坡','远程'];
const CH_ALIAS={'boss':'Boss直聘','boss直聘':'Boss直聘','直聘':'Boss直聘','内推':'内推','官网':'官网','拉勾':'拉勾','猎聘':'猎聘','牛客':'牛客','校招':'校招','猎头':'猎头'};
function parseLine(line){const o={company:'',role:'',city:'',salary:'',channel:'',link:'',status:''},rest=[];
 for(let t of line.split(/\t|\s+|，|,|\||｜|、|；|;/)){t=t.trim();if(!t)continue;const tl=t.toLowerCase(),c=t.replace(/市$/,'');
  if(/^https?:\/\//i.test(t))o.link=t;
  else if(!o.salary&&(/^\d+(\.\d+)?\s*([-~至到]\s*\d+(\.\d+)?)?\s*[kK千万wW]/.test(t)||/^\d+[-~]\d+$/.test(t)||/薪$/.test(t)))o.salary=t;
  else if(!o.city&&CITY.includes(c))o.city=c;
  else if(!o.channel&&CH_ALIAS[tl])o.channel=CH_ALIAS[tl];
  else if(!o.status&&/^(想投|待投|待投递|收藏)$/.test(t))o.status='wish';
  else if(!o.status&&/^(已投|已投递)$/.test(t))o.status='applied';
  else rest.push(t);}
 o.company=rest[0]||'';o.role=rest.slice(1).join(' ');return o;}
function bulkRows(){return bulkText.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!/^(公司|公司名|company)([\s\t,，]|$)/i.test(l)).map(parseLine).filter(o=>o.company);}
function renderBulk(b,head){b.innerHTML=head+`<p class="t2" style="margin:12px 0 8px">每行一个岗位，用空格、逗号或 Tab 隔开，<b style="color:var(--text)">顺序随意</b>：公司、岗位、城市、薪资、渠道（Boss / 内推 / 官网…）、链接都能自动认出来。从 Excel 复制一整块表格粘进来也可以。</p>
 <textarea class="inp" id="bulk" rows="7" style="width:100%" placeholder="星河科技 后端开发 杭州 25-35K 内推&#10;蓝鲸云 Go开发工程师 上海 Boss https://www.zhipin.com/job_detail/xxx&#10;青柠数据，数据平台开发，北京，官网">${esc(bulkText)}</textarea>
 <div style="display:flex;gap:10px;align-items:center;margin:10px 0"><span class="t2">导入为</span><div class="seg"><button data-bulkst="applied" class="${bulkSt==='applied'?'on':''}">已投递（今天）</button><button data-bulkst="wish" class="${bulkSt==='wish'?'on':''}">想投，先收藏</button></div></div>
 <div id="bulkPrev"></div>
 <div class="mfoot"><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="bulksave" id="bulkBtn">导入</button></div>`;
 renderBulkPrev();setTimeout(()=>{const t=document.getElementById('bulk');if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length);}},30);}
function renderBulkPrev(){const L=bulkRows(),el=document.getElementById('bulkPrev'),btn=document.getElementById('bulkBtn');if(!el)return;btn.textContent=L.length?`导入 ${L.length} 条`:'导入';btn.disabled=!L.length;
 el.innerHTML=L.length?`<div class="card" style="max-height:230px;overflow:auto;box-shadow:none"><table><thead><tr><th>公司</th><th>岗位</th><th>城市</th><th>薪资</th><th>渠道</th><th>链接</th></tr></thead><tbody>${L.map(o=>{const dup=db.apps.some(a=>a.company.trim().toLowerCase()===o.company.toLowerCase());return `<tr style="cursor:default"><td><b>${esc(o.company)}</b>${dup?' <span class="pill" style="background:#787e8a22;color:var(--warn)" title="已经记录过这家公司">已有</span>':''}</td><td>${esc(o.role)||'<span class="t2">—</span>'}</td><td>${esc(o.city)}</td><td>${esc(o.salary)}</td><td>${esc(o.channel||'—')}</td><td>${o.link?'🔗':''}</td></tr>`;}).join('')}</tbody></table></div>`:'';}
/* ---------- 浏览器一键添加（收藏夹按钮） ---------- */
const BM_CODE=String.raw`(()=>{const V=2,q=(s,r)=>{for(const x of s.split('|')){try{const e=(r||document).querySelector(x);if(e&&e.innerText&&e.innerText.trim())return e.innerText.trim().split('\n')[0].trim()}catch(_){}}return ''};const h=location.hostname,p=location.pathname,t=document.title,B=(document.body.innerText||'').slice(0,20000),sel=String(getSelection()).trim();const ch=/zhipin/.test(h)?'Boss直聘':/lagou/.test(h)?'拉勾':/liepin/.test(h)?'猎聘':/nowcoder/.test(h)?'牛客':'官网';const CT='北京 上海 广州 深圳 杭州 南京 成都 武汉 西安 苏州 天津 重庆 长沙 厦门 合肥 郑州 青岛 济南 大连 珠海 东莞 佛山 宁波 无锡 福州 昆明 沈阳 哈尔滨 香港 新加坡 远程'.split(' ');const cityOf=s=>CT.find(c=>(s||'').includes(c))||'';const sal=s=>/\d/.test(s||'')?s.replace(/[-]/g,'').slice(0,40):'';const go=d=>{d.v=V;d.channel=ch;d.link=d.link||location.href;const w=window.open('http://127.0.0.1:47321/jobs/add.html#d='+encodeURIComponent(JSON.stringify(d)),'lvji_add','width=560,height=760');if(!w)alert('弹窗被拦截了，请允许这个网站弹出窗口，再点一次「加到履迹」')};if(/zhipin/.test(h)&&/chat/.test(p)){let box=null;for(const x of '.chat-conversation .chat-message|.chat-message-list|.message-list|.chat-record|.chat-conversation|[class*=message-list]|[class*=conversation]'.split('|')){try{const e=document.querySelector(x);if(e&&(e.innerText||'').trim().length>20){box=e;break}}catch(_){}}const text=(sel||(box?box.innerText:B)).trim().slice(-5000);return go({mode:'chat',text,company:q('.chat-conversation .top-info .company|[class*=top-info] [class*=company]|.base-info [class*=company]|.name-box .company'),hr:q('.chat-conversation .top-info .name|[class*=top-info] .name|.base-info .name'),role:q('.chat-conversation .top-info .position|[class*=top-info] [class*=position]|.base-info [class*=position]|.position-name'),link:''})}const L=[],seen={};document.querySelectorAll('.job-card-box,.job-card-wrapper,.job-card-wrap,.job-list-box>li,.job-list li,[class*=job-card]').forEach(c=>{if(L.length>=40)return;const r=q('.job-name|.job-title|[class*=job-name]|[class*=job-title]',c),co=q('.boss-name|.company-name|.company-info .name|[class*=company-name]|[class*=boss-name]',c);if(!r||!co||r===co)return;const k=co+'|'+r;if(seen[k])return;seen[k]=1;const a=c.querySelector('a[href*="job_detail"],a[href*="/job/"],a[href*="jobs"]');L.push({role:r.slice(0,80),company:co.slice(0,60),salary:sal(q('.job-salary|.salary|[class*=salary]',c)),city:cityOf(q('.company-location|.job-area|[class*=location]|[class*=area]',c)),link:a?a.href:''})});const pane=document.querySelector('.job-detail-box,.job-detail-container,.job-banner');let role=q('.job-banner .name h1|.job-banner h1|.job-detail-box .job-name|.job-detail-header .job-name|.job-title|.position-head-wrap-name|.job-apply-content .name|.title-info h1|h1');let company=q('.sider-company .company-info a[title]|.job-detail-box .company-info .name|.job-detail-box [class*=company-name]|.company-info .name|.job-company-name|.company-name|.job_company h3 em|.company-card .name|.business-info .name|.company-header .name|.title-info h3');let salary=sal(q('.job-banner .salary|.job-detail-box .job-salary|.salary|.job-salary|.job-item-salary|.position-head-wrap-position-salary'));if(!salary){const m=B.match(/\d+(\.\d+)?\s*[-~至]\s*\d+(\.\d+)?\s*[kK千万][^\s,，]{0,8}/);salary=m?m[0]:''}const city=cityOf(q('.text-city|.job-detail-box .job-address-desc|.job-city|.work-addr|.job-area|.location-address'))||cityOf(t)||cityOf(B.slice(0,3000));const parts=t.split(/[_|｜\-–—]/).map(s=>s.replace(/招聘|「|」|【|】|\(.*?\)|（.*?）/g,'').trim()).filter(s=>s&&!/BOSS|直聘|拉勾|猎聘|牛客|智联|前程|51job|招聘网|人才网/i.test(s));if(!role)role=parts[0]||'';if(!company)company=parts[1]||'';let jd=sel;if(!jd)jd=(q2=>{for(const x of '.job-sec-text|.job-detail-box .desc|.job_bt|.describtion|.job-description|.position-detail'.split('|')){try{const e=document.querySelector(x);const s=e&&(e.innerText||'').trim();if(s&&s.length>20)return s}catch(_){}}return ''})();if(!jd){let best='';document.querySelectorAll('.job-sec-text,.job-detail-box .desc,.job-detail-section,.job_bt,.job-detail,.describtion,.job-description,.position-detail,[class*=job-desc],[class*=jobDesc]').forEach(e=>{const s=(e.innerText||'').trim();if(s.length>best.length&&s.length<8000)best=s});jd=best}const cb=q('.btn-startchat|.op-btn-chat|[class*=startchat]|[ka*=startchat]|.apply-btn|[class*=apply-btn]');const st=/继续沟通|已投递|已申请|已沟通/.test(cb)?'applied':/立即沟通|投递简历|申请职位|立即申请/.test(cb)?'wish':'';const hr=q('.job-boss-info .name|.job-detail-box .boss-info .name|.boss-info-attr|.recruiter-name');go({mode:L.length>=2&&!(pane&&jd)?'list':'job',company:company.slice(0,60),role:role.slice(0,80),city,salary,jd:jd.slice(0,6000),st,hr:hr.slice(0,40),jobs:L.length>=2?L:[]})})()`;
const bmHref=()=>'javascript:'+encodeURIComponent(BM_CODE);
function renderWeb(b,head){b.innerHTML=head+`<div class="web">
 <p style="margin:14px 0 12px">在 <b>Boss直聘、拉勾、猎聘、牛客、公司官网</b> 上点一下浏览器收藏夹栏里的 <b>「➕ 加到履迹」</b>，会弹出一个小窗口确认：</p>
 <ul class="t2" style="margin:-4px 0 12px;padding-left:20px;line-height:1.9"><li><b>岗位详情页</b>：公司、岗位、城市、薪资、HR、链接和 JD 自动填好；Boss 上显示「继续沟通」的会记成已投递，记录过的岗位只更新不重复</li><li><b>搜索 / 推荐列表页</b>：整页岗位列出来，勾选后一起收进「待投递」</li><li><b>Boss 聊天页</b>：收下当前聊天，是面试邀请就自动用 AI 建日程，其他内容存进这家公司的备注</li></ul>
 <div class="steps"><div><span>1</span>在你平时用的浏览器里按 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>，显示收藏夹栏</div><div><span>2</span>把下面这个按钮<b>拖到收藏夹栏</b>上。以前拖过的，删掉旧的再拖一次新的</div></div>
 <div style="text-align:center;margin:20px 0 14px"><a class="bmk" href="${esc(bmHref())}" onclick="event.preventDefault();toast('要把它拖到浏览器的收藏夹栏上，再到招聘网站点它')" title="把我拖到收藏夹栏">➕ 加到履迹</a></div>
 <p class="t2">拖不动？<a href="#" data-act="copybm">复制按钮代码</a>，在收藏夹栏点右键 →「添加收藏夹」，名称填「加到履迹」，网址粘贴进去即可。</p>
 <p class="t2">识别得不准可以在小窗口里直接改；先选中页面上的一段文字再点，会把选中的内容当作 JD。电脑重启后，需要先打开一次履迹才能用。</p>
 <div class="mfoot"><button class="btn" data-act="testbm">先看看小窗口长什么样</button><button class="btn primary" data-act="mclose">知道了</button></div></div>`;}
function saveAdd(){
 if(!document.getElementById('nCompany'))return;
 const g=id=>document.getElementById(id).value.trim();
 if(!g('nCompany')||!g('nRole')){toast('请至少填写公司和岗位');return;}
 const dup=db.apps.find(a=>a.company.trim().toLowerCase()===g('nCompany').toLowerCase()&&a.role.trim().toLowerCase()===g('nRole').toLowerCase());
 if(dup&&!confirm(`「${dup.company} · ${dup.role}」已经记录过了（${dup.appliedAt||'未投递'}），还要再加一条吗？`))return;
 const a=newApp({company:g('nCompany'),role:g('nRole'),city:g('nCity'),salary:g('nSalary'),channel:g('nCh'),status:g('nSt'),appliedAt:g('nSt')==='wish'?'':g('nDate'),priority:+g('nPri'),link:g('nLink'),notes:g('nJD')});
 logStatus(a,'',a.status);db.apps.push(a);persist();closeModal();render();openDrawer(a.id);toast('已添加 '+a.company);
}
let cmdSel=0;
function openCmdk(){const b=document.getElementById('mbox');b.className='card cmdk';b.innerHTML=`<input id="cq" placeholder="搜索投递、人脉、故事、能力、日记、题目、页面…（↑↓ 选择，Enter 打开）"><div class="res" id="cres"></div>`;document.getElementById('modal').classList.add('on');cmdSel=0;renderCmdk();setTimeout(()=>document.getElementById('cq').focus(),30);}
let CMD_L=[];
function cmdResults(){const k=(document.getElementById('cq')?.value||'').trim().toLowerCase(),has=x=>String(x||'').toLowerCase().includes(k),R=[];
 db.apps.filter(a=>!k||has([a.company,a.role,a.city,a.resume,a.notes].join(' '))).sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,k?6:8).forEach(a=>R.push({ic:`<span class="dot" style="background:${SM[a.status].c}"></span>`,t:a.company,s:'投递 · '+a.role,tag:stTag(a.status),run:()=>openDrawer(a.id)}));
 if(k){
  [['＋','新增投递','添加 投递 新建 add',()=>openAdd('applied')],['📋','批量添加投递','批量 粘贴 导入',()=>openAdd('applied','bulk')],['🎴','抽卡复习面试题','复习 题库 抽卡',()=>startReview()],['🎙','AI 模拟面试','模拟 面试 mock ai 练习 面试官',()=>openMock('')],['📋','粘贴面试邀请，自动建日程','邀请 日程 面试 粘贴 ai 识别',()=>openInvite()],['💬','问问 AI 求职教练','ai 教练 问 聊天 建议 chat',()=>openChat()],['🧭','AI 找岗位（联网搜索）','找 岗位 搜索 招聘 推荐 ai',()=>openHunt()],
   ['🍅','开始专注 25 分钟','专注 番茄 计时 focus',()=>document.querySelector('[data-focus="25"]')?.click()],['✎','写今天的日记','日记 记录 今天',()=>{jDate=today();view='journal';render();}],
   ['🎤','练习自我介绍','自我介绍 练习 计时',()=>openIntro('1')],['📊','导出投递为 Excel','导出 表格 excel csv',()=>{download(`履迹-投递记录-${today()}.csv`,toCSV(),'text/csv;charset=utf-8');toast('已导出');}],
   ['💾','立即备份','备份 保存',()=>{persist();push().then(()=>toast(sync.state==='ok'?'已备份':'备份失败'));}],['🕰','历史备份 / 恢复数据','历史 恢复 备份 还原',()=>openHistory()],
   ['🌓','切换深色 / 浅色主题','主题 深色 浅色 夜间 theme',()=>document.getElementById('themeBtn')?.click()],['🤖','查看 AI 额度','额度 claude codex agent 用量',()=>{view='agent';render();}]]
   .filter(([,n,kw])=>has(n+' '+kw)).slice(0,5).forEach(([ic,n,,run])=>R.push({ic,t:n,s:'操作',run}));
  VIEWS.filter(([,n])=>has(n)).forEach(([v,n])=>R.push({ic:'↪',t:n,s:'页面',run:()=>{view=v;render();}}));
  db.people.filter(x=>has(x.name+' '+x.company+' '+x.notes)).slice(0,4).forEach(x=>R.push({ic:'🤝',t:x.name,s:'人脉 · '+(x.company||''),run:()=>editPerson(x)}));
  db.stories.filter(x=>has([x.title,x.s,x.t,x.a,x.r].join(' '))).slice(0,4).forEach(x=>R.push({ic:'💬',t:x.title,s:'面试故事',run:()=>editStory(x)}));
  db.skills.filter(x=>has(x.name+' '+x.notes)).slice(0,4).forEach(x=>R.push({ic:'🌱',t:x.name,s:'能力 · '+LVN[x.level||0],run:()=>editSkill(x)}));
  db.journal.filter(x=>has(x.text+' '+x.tags)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4).forEach(x=>R.push({ic:'✎',t:x.date,s:'日记 · '+x.text.slice(0,40),run:()=>{jDate=x.date;view='journal';render();}}));
  allQuestions().filter(x=>!x.dup&&has(x.q)).slice(0,4).forEach(x=>R.push({ic:'📚',t:x.q,s:'题库 · '+x.a.company,run:()=>{qSearch=x.q;view='bank';render();}}));
 }
 return CMD_L=R.slice(0,16);}
function runCmd(i){const r=CMD_L[i];if(!r)return;closeModal();if(openId)closeDrawer();r.run();}
function renderCmdk(){const L=cmdResults();cmdSel=Math.min(cmdSel,Math.max(0,L.length-1));document.getElementById('cres').innerHTML=L.length?L.map((r,i)=>`<div class="it ${i===cmdSel?'sel':''}" data-cmd="${i}"><span class="cic">${r.ic}</span><div style="flex:1;min-width:0"><div class="t1" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.t)}</div><div class="t2" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.s)}</div></div>${r.tag||''}</div>`).join(''):'<div class="empty">没有找到</div>';document.querySelector('.cmdk .it.sel')?.scrollIntoView({block:'nearest'});}
const PREP_ITEMS=['把 JD 里的技术点过一遍（尤其橙色、灰色的）','看一遍这家公司以前问过的题','准备 2 个能讲的 STAR 故事','把自我介绍顺一遍','准备 2~3 个反问面试官的问题','线上面试：测摄像头 / 麦克风 / 网络；线下：确认路线和时间','打开投递时用的那份简历，熟悉上面写的每一点'];
const ASK_BACK=['这个岗位入职后前 3 个月主要做什么？','团队现在的规模和技术栈是怎样的？','您觉得这个岗位做得好的人有什么共同点？','新人一般怎么培养，有导师制吗？','后续还有几轮面试，大概多久出结果？'];
function prepHtml(a,e){
 const F=kwFind(a.notes||'').map(k=>{const x=skillFor(k);return {k,lv:x?(+x.level||0):-1};}).sort((x,y)=>x.lv-y.lv);
 const Q=allQuestions().filter(x=>!x.dup);
 const same=Q.filter(x=>x.a.company===a.company);
 const rel=F.length?Q.filter(x=>x.a.company!==a.company&&db.qmark[x.h]!=='ok'&&F.some(f=>x.q.toLowerCase().includes(f.k.toLowerCase()))).slice(0,8):[];
 const left=e.at?Math.round((new Date(e.at)-Date.now())/36e5):null;
 const P=e.prep||{},done=PREP_ITEMS.filter((_,i)=>P[i]).length,intro=db.settings.intro1||db.settings.intro3||'';
 const qli=x=>`<li>${esc(x.q)}${x.url?' '+ext(safeUrl(x.url),'↗','t2'):''} <span class="t2">· ${esc(x.a.company)}${db.qmark[x.h]==='ok'?' · ✓已掌握':''}</span></li>`;
 return `<div class="prep-h"><div><h3 style="margin:0">🎯 ${esc(a.company)} · ${esc(e.title||EV[e.type])}</h3><div class="t2">${esc(a.role)}${e.at?' · '+e.at.replace('T',' '):''}${e.place?' · '+esc(e.place):''}</div></div>
  ${left!==null&&left>=0?`<div class="cd"><b>${left>=48?Math.round(left/24)+'</b> 天':left+'</b> 小时'}<span>后开始</span></div>`:''}</div>
 <div class="prep-b">
  <div class="ps"><h4>✅ 准备清单 <span class="t2">${done}/${PREP_ITEMS.length}</span></h4>${PREP_ITEMS.map((t,i)=>`<label class="pi"><input type="checkbox" class="chk" data-prep="${a.id}|${e.id}|${i}" ${P[i]?'checked':''}>${esc(t)}</label>`).join('')}</div>
  <div class="ps"><h4>🔍 了解公司</h4><div class="quick">${COMPANY_LINKS.map(([n,ic,f])=>ext(f(a),ic+' '+n,'btn sm')).join('')}${ext(safeUrl(a.link),'📄 岗位原文','btn sm')}</div></div>
  <div class="ps"><h4>🧩 JD 要求 <span class="t2">按掌握程度从弱到强</span></h4>${F.length?`<div class="quick">${F.map(r=>`<span class="tag" style="${r.lv<0?'':r.lv<3?'background:#787e8a1a;color:var(--warn)':'background:#4b48521a;color:var(--ok)'}">${r.lv<0?'？':r.lv>=3?'✓ ':''}${esc(r.k)}${r.lv>=0&&r.lv<3?' · '+LVN[r.lv]:''}</span>`).join('')}</div>`:'<div class="t2">备注里还没有 JD，粘贴进去就能分析要求。</div>'}</div>
  <div class="ps"><h4>📚 这家以前问过 <span class="t2">${same.length} 题</span></h4>${same.length?`<ol>${same.slice(0,12).map(qli).join('')}</ol>`:'<div class="t2">还没有这家公司的面试记录。</div>'}
   ${rel.length?`<h4 style="margin-top:10px">🧠 和 JD 相关、还没掌握的题</h4><ol>${rel.map(qli).join('')}</ol>`:''}</div>
  <div class="ps"><h4>📖 可以讲的故事 <span class="t2"><a href="#" data-act="gostories">去故事库 →</a></span></h4>${db.stories.length?db.stories.slice(0,5).map(x=>`<div class="t2" style="margin:3px 0"><b style="color:var(--text)">${esc(x.title||'未命名')}</b>${x.r?' — '+esc(x.r.slice(0,50)):''}</div>`).join(''):'<div class="t2">故事库还是空的，行为面试前至少准备 2 个。</div>'}</div>
  <div class="ps"><h4>🎤 自我介绍 ${intro?'<button class="btn sm" data-act="introprac" style="margin-left:6px">计时练一遍</button>':''}</h4>${intro?`<div class="t2 clamp3">${esc(intro)}</div>`:'<div class="t2">还没写自我介绍，<a href="#" data-act="gostories">去故事库写一份</a>。</div>'}</div>
  <div class="ps"><h4>🙋 可以反问的问题</h4><ul>${ASK_BACK.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></div>
 </div>
 <div class="mfoot"><button class="btn" data-act="mock" data-a="${a.id}" style="margin-right:auto">🎙 先模拟一遍</button><button class="btn" data-act="prepopen" data-a="${a.id}">打开投递详情</button><button class="btn primary" data-act="mclose">好的</button></div>`;}
function openPrep(aid,eid){const a=appById(aid),e=a?.events.find(x=>x.id===eid);if(!e)return;PREP={aid,eid};const b=document.getElementById('mbox');b.className='card mbox prep';b.innerHTML=prepHtml(a,e);document.getElementById('modal').classList.add('on');}
let PREP=null;
/* ---------- 自我介绍计时练习 ---------- */
let INTRO=null;
function introEst(t){const n=String(t||'').replace(/\s/g,'').length;return {n,sec:Math.round(n/220*60)};}
function openIntro(which){const txt=(which==='3'?db.settings.intro3:db.settings.intro1)||db.settings.intro1||db.settings.intro3||'';if(!txt)return toast('先在故事库里写好自我介绍');
 const target=which==='3'?180:60;INTRO={t0:Date.now(),target,iv:setInterval(tickIntro,250)};
 const b=document.getElementById('mbox');b.className='card mbox intro';
 b.innerHTML=`<h3>🎤 自我介绍练习 · 目标 ${target/60} 分钟</h3><div class="introtxt">${esc(txt)}</div><div class="introbar"><i id="introBar"></i></div><div class="mfoot"><span class="introt" id="introT">0:00</span><span style="flex:1"></span><button class="btn" data-act="mclose">取消</button><button class="btn primary" data-act="introstop">讲完了</button></div>`;
 document.getElementById('modal').classList.add('on');}
function tickIntro(){if(!INTRO)return;const s=(Date.now()-INTRO.t0)/1e3,t=document.getElementById('introT'),bar=document.getElementById('introBar');if(!t){clearInterval(INTRO.iv);INTRO=null;return;}
 t.textContent=`${Math.floor(s/60)}:${pad(Math.floor(s%60))}`;bar.style.width=Math.min(100,s/INTRO.target*100)+'%';bar.style.background=s>INTRO.target*1.15?'var(--bad)':s>INTRO.target*.85?'var(--ok)':'var(--accent)';}
function stopIntro(){if(!INTRO)return;clearInterval(INTRO.iv);const s=Math.round((Date.now()-INTRO.t0)/1e3),tg=INTRO.target;INTRO=null;
 (db.settings.introLog=db.settings.introLog||[]).push({date:today(),sec:s,target:tg});if(db.settings.introLog.length>60)db.settings.introLog.shift();persist();closeModal();
 const d=s-tg;toast(Math.abs(d)<=tg*.15?`👍 用时 ${s} 秒，时间刚刚好`:d>0?`用时 ${s} 秒，超了 ${d} 秒，可以再精简一点`:`用时 ${s} 秒，比目标短 ${-d} 秒，可以多讲一点亮点`);if(view==='stories')render();}
/* ---------- 历史备份 ---------- */
async function openHistory(){if(!TOKEN)return;const b=document.getElementById('mbox');b.className='card mbox hist-m';b.innerHTML='<h3>🕰 历史备份</h3><div class="empty">正在读取…</div>';document.getElementById('modal').classList.add('on');
 let L=[];try{const r=await fetch('http://127.0.0.1:47321/api/backups',{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)throw 0;L=(await r.json()).items||[];}catch{b.innerHTML='<h3>🕰 历史备份</h3><div class="empty">读取失败，请从桌面快捷方式重新打开履迹</div><div class="mfoot"><button class="btn" data-act="mclose">关闭</button></div>';return;}
 HIST=L;const fmt=t=>new Date(t).toLocaleString('zh-CN',{month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'});
 b.innerHTML=`<h3>🕰 历史备份</h3><p class="t2" style="margin:-4px 0 10px">每天自动保留一份，最近 30 天。恢复前会先把当前数据另存一份，恢复错了还能再恢复回来。</p>
 <div class="histl">${L.length?L.map((x,i)=>`<div class="hi"><div style="flex:1;min-width:0"><div class="t1">${x.kind==='snap'?'↩ 恢复前的状态 · ':''}${fmt(x.savedAt)}</div><div class="t2">${x.apps} 条投递 · ${x.journal} 篇日记 · ${x.questions} 场有题目记录 · ${Math.max(1,Math.round(x.size/1024))} KB</div></div>${x.savedAt===db.savedAt?'<span class="tag">当前</span>':`<button class="btn sm" data-act="restore" data-i="${i}">恢复到这里</button>`}</div>`).join(''):'<div class="empty">还没有历史备份</div>'}</div>
 <div class="mfoot"><button class="btn" data-act="mclose">关闭</button></div>`;}
let HIST=[];
async function restoreBackup(i){const x=HIST[+i];if(!x)return;
 if(!confirm(`把数据恢复到 ${new Date(x.savedAt).toLocaleString('zh-CN')} 的状态？\n（${x.apps} 条投递。当前数据会先另存一份，可以随时再恢复回来）`))return;
 const H={'content-type':'application/json','x-token':TOKEN};
 try{
  const s=await fetch('http://127.0.0.1:47321/api/backups/snapshot',{method:'PUT',headers:H,body:JSON.stringify({savedAt:db.savedAt,data:db})});if(!s.ok)throw new Error('当前数据另存失败，已取消恢复');
  const r=await fetch(`http://127.0.0.1:47321/api/backups/file?kind=${x.kind}&name=${encodeURIComponent(x.name)}`,{headers:{'x-token':TOKEN},cache:'no-store'});if(!r.ok)throw new Error('读取备份失败');
  const j=await r.json();if(!j.data||!Array.isArray(j.data.apps))throw new Error('备份文件格式不对');
  db=normalize(j.data);delete db._cleaned;db.savedAt=Date.now();flushSave();await push();closeModal();applyTheme();render();toast(`已恢复（${db.apps.length} 条投递）。恢复前的数据存在「历史备份」里`);
 }catch(e){toast(String(e.message||e));}}
function closeModal(){FORM=null;RV=null;MK=null;AIREQ++;mkStopVoice();if(LISTEN){LISTEN.on=false;try{LISTEN.rec?.stop();}catch{}LISTEN=null;}FC=null;PREP=null;if(INTRO){clearInterval(INTRO.iv);INTRO=null;}document.getElementById('modal').classList.remove('on');}

/* ========== 日历文件 / 提醒 ========== */
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
const icsT=(at,add=0)=>{const d=new Date(new Date(at).getTime()+add*6e4);return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;};
function makeICS(list){const st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
 const ev=list.map(({a,e})=>['BEGIN:VEVENT',`UID:${e.id}@jobtracker`,`DTSTAMP:${st}`,`DTSTART:${icsT(e.at)}`,`DTEND:${icsT(e.at,60)}`,`SUMMARY:${icsEsc(a.company+' · '+(e.title||EV[e.type]))}`,`DESCRIPTION:${icsEsc((a.role||'')+(e.place?'\n'+e.place:''))}`,e.place?`LOCATION:${icsEsc(e.place)}`:'','BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY',`DESCRIPTION:${icsEsc(a.company+' 即将开始')}`,'END:VALARM','END:VEVENT'].filter(Boolean).join('\r\n'));
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//JobTracker//CN','CALSCALE:GREGORIAN',...ev,'END:VCALENDAR'].join('\r\n');}
function download(name,text,type){const b=new Blob([text],{type});const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
const notified=JSON.parse(localStorage.getItem('jt_notified')||'{}');
function checkReminders(){
 const now=Date.now();let changed=false;
 for(const {a,e} of allEvents()){if(e.done||!e.at)continue;const mins=(new Date(e.at).getTime()-now)/6e4;
  for(const w of [60,15]){if(mins>0&&mins<=w){const k=`${e.id}|${e.at}|${w}`;if(notified[k])continue;notified[k]=now;changed=true;
   const msg=`${a.company} · ${e.title||EV[e.type]} 将在 ${Math.max(1,Math.round(mins))} 分钟后开始`;toast('⏰ '+msg,null,6000);
   if(db.settings.notify&&typeof Notification!=='undefined'&&Notification.permission==='granted'){try{const n=new Notification('面试提醒',{body:msg+(e.place?'\n'+e.place:''),tag:k});n.onclick=()=>{focus();openDrawer(a.id);};}catch{}}break;}}}
 if(changed){for(const k in notified)if(now-notified[k]>3*864e5)delete notified[k];localStorage.setItem('jt_notified',JSON.stringify(notified));}
}

/* ========== 交互 ========== */
let tt;function toast(s,action,ms=2600){const t=document.getElementById('toast');t.innerHTML=`<span>${esc(s)}</span>`;t.classList.toggle('act',!!action);
 if(action){const b=document.createElement('button');b.textContent=action[0];b.onclick=()=>{action[1]();t.classList.remove('on');};t.appendChild(b);ms=Math.max(ms,5000);}
 t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),ms);}

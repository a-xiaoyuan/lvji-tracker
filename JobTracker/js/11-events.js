// 履迹 · 状态切换与所有点击、输入、拖拽事件
// 普通脚本（不是模块）：所有文件共享同一个全局作用域，按 index.html 里的顺序加载。
'use strict';
function setStatus(a,k,quiet){
 if(a.status===k)return;const old=a.status;a.status=k;logStatus(a,old,k);
 if(k==='rejected'&&!quiet&&!a.fail)setTimeout(()=>{if(a.status==='rejected'&&!document.getElementById('modal').classList.contains('on'))openFail(a,old);},400);
 if(k!=='wish'&&old==='wish'&&!a.appliedAt)a.appliedAt=today();
 if(k==='offer'){toast('🎉 恭喜拿到 '+a.company+' 的 Offer！记得填写薪资构成');confetti(200);}
 touch(a);
}
document.addEventListener('input',e=>{const T=e.target;if(T.dataset&&T.dataset.intro){db.settings[T.dataset.intro]=T.value;persist();const l=T.closest('.f')?.querySelector('label .t2');if(l){const x=introEst(T.value);l.textContent=`${x.n} 字 · 约 ${x.sec} 秒`;}}});
document.addEventListener('click',e=>{
 const T=e.target;
 if(T.closest('a[target=_blank]'))return; // 外部链接正常打开
 const rr=T.closest('[data-rvrate]');if(rr&&RV){RV.rating=+rr.dataset.rvrate;renderRv();return;}
 const rw=T.closest('[data-rvweak]');if(rw&&RV){rvGrab();const k=rw.dataset.rvweak;RV.weak=RV.weak.includes(k)?RV.weak.filter(x=>x!==k):[...RV.weak,k];renderRv();return;}
 if(/^SAKUGA-(CHECKBOX|TOGGLE|SLIDER)$/.test(T.tagName)&&!e.skChange)return;
 if(T.closest('[data-done]')){const [aid,eid]=T.closest('[data-done]').dataset.done.split('|');const a=appById(aid),ev=a.events.find(x=>x.id===eid);ev.done=T.checked;touch(a);render();e.stopPropagation();return;}
 const pr=T.closest('[data-prep]');if(pr){const [aid,eid,i]=pr.dataset.prep.split('|'),a=appById(aid),ev=a?.events.find(x=>x.id===eid);if(ev){ev.prep=ev.prep||{};ev.prep[i]=pr.checked;touch(a);const h=pr.closest('.ps')?.querySelector('h4 .t2');if(h)h.textContent=`${PREP_ITEMS.filter((_,k)=>ev.prep[k]).length}/${PREP_ITEMS.length}`;}return;}
 const tc=T.closest('[data-tplcopy]');if(tc){e.preventDefault();const t=db.tpls.find(x=>x.id===tc.dataset.tplcopy);if(t){const oa=openId?appById(openId):null;if(oa){oa.tplUse=oa.tplUse||[];oa.tplUse.push({tpl:t.id,at:today()});persist();}copyText(tplFill(t.body,openId?appById(openId):null),openId?`已复制「${t.title}」，已填好 ${appById(openId)?.company||''} 的信息`:`已复制「${t.title}」`);}return;}
 const te=T.closest('[data-tpledit]');if(te){editTpl(db.tpls.find(x=>x.id===te.dataset.tpledit));return;}
 const nv=T.closest('[data-view]');if(nv){e.preventDefault();view=nv.dataset.view;if(openId)closeDrawer();render();document.querySelector('main').scrollTop=0;return;}
 const actEl=T.closest('[data-act]'),act=actEl?.dataset.act;
 if(act){e.preventDefault();
  if(act==='prep')return openPrep(actEl.dataset.a,actEl.dataset.e);
  if(act==='introprac')return openIntro(actEl.dataset.w||'1');
  if(act==='introstop')return stopIntro();
  if(act==='gostories'){closeModal();view='stories';if(openId)closeDrawer();return render();}
  if(act==='prepopen'){closeModal();return openDrawer(actEl.dataset.a);}
  if(act==='followcopy'){const a=appById(actEl.dataset.a),t=db.tpls.find(x=>x.id==='t3');if(a&&t){copyText(tplFill(t.body,a),'已复制跟进话术，去 Boss / 邮件里发给 HR 吧');a.snooze=dstr(new Date(Date.now()+5*864e5));touch(a);render();}return;}
  if(act==='qopen'){closeModal();return openDrawer(actEl.dataset.a);}
  if(act==='qfollow'){const a=appById(actEl.dataset.a);if(a){a.events.push({id:uid(),type:'followup',at:nowLocal(),title:'已跟进',place:'',done:true});touch(a);render();toast('已标记跟进：'+a.company);}return;}
  if(act==='snooze'){const a=appById(actEl.dataset.a);if(a){a.snooze=dstr(new Date(Date.now()+7*864e5));touch(a);render();toast('好的，7 天后再提醒');}return;}
  if(act==='mock')return openMock(actEl.dataset.a||openId||'');
  if(act==='mkstart')return mkStart();
  if(act==='mkans')return mkAnswer();
  if(act==='mkskip')return mkAnswer(true);
  if(act==='mkend'||act==='mkfinish')return mkFinish();
  if(act==='mkvoice')return mkVoice();
  if(act==='mkagain'||act==='mkretrystart'){const id=MK?.aid||'';return openMock(id);}
  if(act==='mkview')return openMockReport(actEl.dataset.id);
  if(act==='mkdel'){const id=actEl.dataset.id,i=db.mocks.findIndex(m=>m.id===id);if(i>=0)db.mocks.splice(i,1);for(const a of db.apps)a.events=a.events.filter(e=>e.mock!==id);persist();closeModal();render();if(openId)renderDrawer();return toast('已删除这次模拟面试');}
  if(act==='invite')return openInvite('',actEl.dataset.a||'');
  if(act==='invgo'||act==='invgo2')return invGo();
  if(act==='invback')return openInvite(INV?.text||'',INV?.aid||'');
  if(act==='invsave')return invSave();
  if(act==='jdadvice')return openJdAdvice(actEl.dataset.a);
if(act==='tailorgo')return tailorGo(actEl.dataset.a);
if(act==='tailorbind')return tailorBind(actEl.dataset.a);
if(act==='huntsub')return huntSaveSub();
if(act==='subscan')return subScan(actEl.dataset.a);
if(act==='subauto'){db.settings.subAuto=!db.settings.subAuto;actEl.checked=db.settings.subAuto;persist();render();toast(db.settings.subAuto?'已打开：以后打开履迹时自动扫描到期的订阅':'已关闭自动扫描，需要时手动点「扫描新岗位」');return;}
if(act==='subdel'){const s2=db.subs.find(x=>x.id===actEl.dataset.a);if(s2){db.subs=db.subs.filter(x=>x!==s2);persist();render();toast('已删除这个订阅');}return;}
if(act==='notice')return openNotice();
if(act==='noticego')return noticeGo();
if(act==='noticeok')return noticeOk();
  if(act==='jdadvice2')return openJdAdvice(JDA,true);
  if(act==='aicopy'){const o=document.getElementById('msgOut');return copyText(o?o.value:INV?.copy||'','已复制');}
  if(act==='aians')return aiAnswer(actEl.dataset.h,actEl);
  if(act==='aimsg')return openAiMsg(actEl.dataset.a);
  if(act==='msggo')return msgGo(actEl.dataset.a);
  if(act==='aireview')return aiReview();
  if(act==='airvfill')return aiRvFill();
  if(act==='extopen'){fetch('http://127.0.0.1:47321/api/ext/open',{method:'POST',headers:{'x-token':TOKEN}}).then(r=>r.json().then(j=>{if(!r.ok)throw new Error(j.error||r.status);toast('已打开扩展文件夹，接着按第 2、3 步做');})).catch(e=>toast('😵 '+(e.message==='Failed to fetch'?'要从桌面的「履迹」快捷方式打开才行':e.message),null,6000));return;}
  if(act==='extcopy'){copyText('edge://extensions','已复制，粘到 Edge 地址栏回车');return;}
  if(act==='lcsave')return lcSave();
  if(act==='lcsync'){e.preventDefault();return lcSync(true);}
  if(act==='lcoff'){db.settings.lcUser='';db.lc=null;db.lcErr='';persist();render();return toast('已断开力扣同步');}
  if(act==='company')return openCompany(actEl.dataset.c);
  if(act==='coopen'){e.preventDefault();closeModal();return openDrawer(actEl.dataset.a);}
  if(act==='chat')return openChat();
  if(act==='chatq')return chatSend(actEl.dataset.q);
  if(act==='chatsend')return chatSend();
  if(act==='chatclear'){e.preventDefault();CHAT.msgs=[];db.chat=[];persist();return renderChat();}
  if(act==='listen')return openListen(actEl.dataset.a,actEl.dataset.e);
  if(act==='lsrec')return lsRec();
  if(act==='lsgo')return lsGo();
  if(act==='lsback')return renderListen();
  if(act==='hunt')return openHunt();
  if(act==='huntnew'){HUNT=null;return openHunt();}
  if(act==='huntgo')return huntGo();
  if(act==='huntadd')return huntAdd();
  if(act==='ivmsg'){openAiMsg(actEl.dataset.a);const k=document.getElementById('msgK');if(k)k.value=MSG_KIND[0];return;}
  if(act==='ivdead'){const a=appById(actEl.dataset.a);if(a){setStatus(a,'rejected');render();}return;}
  if(act==='intel')return intel(actEl.dataset.a);
  if(act==='aitest')return aiTest();
  if(act==='dskey'){const k=(document.getElementById('dsKey')?.value||'').trim();if(!k&&!confirm('清除已保存的 DeepSeek 密钥？'))return;fetch(AI_URL+'/key',{method:'POST',headers:{'content-type':'application/json','x-token':TOKEN},body:JSON.stringify({key:k})}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'HTTP '+r.status);document.getElementById('dsKey').value='';toast(k?'✓ 密钥已保存，只存在这台电脑上':'已清除密钥');aiStatusFill();}).catch(e=>toast('😵 '+(e.message==='Failed to fetch'?'要从桌面的「履迹」快捷方式打开才能保存':e.message),null,6000));return;}
  if(act==='failtopic'){qTopic=actEl.dataset.t;view='bank';render();document.querySelector('main').scrollTop=0;return;}
  if(act==='failskill'){const n=actEl.dataset.s;if(!db.skills.some(x=>x.name===n))db.skills.push({id:uid(),name:n,cat:'面试薄弱点',level:1,target:3,notes:'来自未通过和面试复盘记录',link:''});persist();render();toast(`已把「${n}」加进能力树`);return;}
  if(act==='failnext'){const a=db.apps.find(x=>x.status==='rejected'&&!x.fail);if(a)openFail(a);return;}
  if(act==='failedit'){const a=appById(actEl.dataset.a);if(a)openFail(a);return;}
  if(act==='rvopen')return openRv(actEl.dataset.a,actEl.dataset.e);
  if(act==='rvnext'||act==='rvprev'){if(RV){rvGrab();RV.step+=act==='rvnext'?1:-1;renderRv();}return;}
  if(act==='rvsave'){if(RV)rvSave();return;}
  if(act==='ghosted'){const a=appById(actEl.dataset.a);if(a){a.fail={stage:'简历筛选',reasons:['没回音'],note:'',at:today()};setStatus(a,'rejected',true);render();toast(`已把 ${a.company} 移到「未通过」，别灰心，下一个更好`);}return;}
  if(act==='history')return openHistory();
  if(act==='restore')return restoreBackup(actEl.dataset.i);
  if(act==='agsnooze'){const S=agSnoozed();S[actEl.dataset.k]=Date.now()+7*864e5;localStorage.setItem('jt_agsnooze',JSON.stringify(S));AG.sig=null;return render();}
  if(act==='agjump'){document.getElementById('ag-'+actEl.dataset.k)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(act==='extdiagcopy')return copyText('履迹助手诊断信息\n'+EXT_DIAG.map(d=>`${new Date(d.at).toISOString()} | ${d.site} | ${d.stage} | ${d.why} | ${d.url}`).join('\n'),'已复制诊断信息');
  if(act==='agenton'||act==='agentoff')return agentToggle(act==='agenton');
  if(act==='agentrefresh'){AG.at=0;loadAgent(true);return toast('正在刷新…');}
  if(act==='addtpl')return editTpl();
  if(act==='resettpl'){db.tpls=DEF_TPL.map(t=>({...t}));persist();return render();}
  if(act==='copymiss')return copyText(actEl.dataset.k,'已复制，去简历里补上会的那些');
  if(act==='listmore'){LIST_LIM+=300;return render();}
  if(act==='csv'){download(`履迹-投递记录-${today()}.csv`,toCSV(),'text/csv;charset=utf-8');return toast(`已导出 ${db.apps.length} 条，可以直接用 Excel 打开`);}
  if(act==='fold'){const k=actEl.dataset.k;FOLD[k]=FOLD[k]?0:1;localStorage.setItem('jt_fold',JSON.stringify(FOLD));return render();}
  if(act==='add')return openAdd(actEl.dataset.st);
  if(act==='bulk')return openAdd('applied','bulk');
  if(act==='web')return openAdd('applied','web');
  if(act==='bulksave'){const L=bulkRows();if(!L.length)return;for(const o of L){const st=o.status||bulkSt;const a=newApp({company:o.company,role:o.role,city:o.city,salary:o.salary,channel:o.channel||'其他',link:o.link,status:st,appliedAt:st==='wish'?'':today()});logStatus(a,'',a.status);db.apps.push(a);}bulkText='';persist();closeModal();render();toast(`🎉 已导入 ${L.length} 条投递`);confetti(70);return;}
  if(act==='copybm'){navigator.clipboard.writeText(bmHref()).then(()=>toast('已复制，去收藏夹栏右键「添加收藏夹」，把它粘贴到网址里'),()=>toast('复制失败，请直接拖动按钮'));return;}
  if(act==='testbm'){window.open('http://127.0.0.1:47321/jobs/add.html#d='+encodeURIComponent(JSON.stringify({company:'示例科技',role:'后端开发工程师',city:'杭州',salary:'25-35K·15薪',channel:'Boss直聘',link:'https://www.zhipin.com/',jd:'岗位要求：熟悉 Java、Spring Boot、MySQL、Redis，了解 Kafka，有分布式系统经验。'})),'lvji_add','width=540,height=720');return toast('这只是演示，不想要的话关掉小窗口就行');}
  if(act==='sample')return loadSample();
  if(act==='close')return closeDrawer();
  if(act==='mclose'){const wasFC=!!FC;closeModal();if(wasFC)render();return;}
  if(act==='msave')return saveAdd();
  if(act==='cmdk')return openCmdk();
  if(act==='ruyeRetry'){ruyeLoaded=false;return showRuye();}
  if(act==='fsave')return formSave();
  if(act==='review')return startReview();
  if(act==='weakreview')return startReview(true);
  if(act==='jdadd'){const n=JD_MISSING.length;JD_MISSING.forEach(name=>db.skills.push({id:uid(),name,cat:'待分类',level:1,target:3,notes:'从岗位 JD 里加入',link:''}));persist();const nj=document.getElementById('nJD');if(nj)document.getElementById('jdBox').innerHTML=jdHtml(nj.value);else if(openId)renderDrawer();return toast(`已把 ${n} 项加入能力树，去给自己打个分吧`);}
  if(act==='poster')return openPoster();
  if(act==='posterdown'){const cv=document.getElementById('posterCv');if(cv)cv.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='求职季海报.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),4000);});return;}
  if(act==='addms'){const d=document.getElementById('msDate').value,t=document.getElementById('msTitle').value.trim();if(!t){document.getElementById('msTitle').focus();return toast('写一下这个里程碑');}db.milestones.push({id:uid(),date:d||today(),title:t});persist();render();return toast('⭐ 已记进你的历程');}
  if(act==='copyreview'){const Rg=pRange(rvU,rvO),c=pStats(Rg),rv=db.reviews[rvU+':'+Rg[0]]||{},lab=rvLab();
   const txt=[`# 履迹 · ${lab}回顾（${Rg[0]} ~ ${Rg[1]}）`,'',`- 投递 ${c.apps} 个，面试 ${c.iv} 场${c.offers.length?'，拿到 '+c.offers.join('、')+' 的 Offer':''}`,`- 记录 ${c.days} 天，学习 ${c.hours} 小时，专注 ${c.focus} 分钟${c.mood?'，平均心情 '+MOODS[Math.round(c.mood)-1]:''}`,`- 打卡：${db.habits.map(h=>h.name+' '+c.habits[h.id]+' 天').join('，')||'无'}`,'','## 做得好的',rv.good||'（未填写）','','## 需要改进的',rv.bad||'（未填写）','','## 下阶段计划',rv.next||'（未填写）'].join('\n');
   navigator.clipboard.writeText(txt).then(()=>toast('已复制，可以直接粘贴到笔记里'),()=>{download(`履迹-${lab}回顾.md`,txt,'text/markdown');toast('无法使用剪贴板，已改为下载文件');});return;}
  if(act==='fdel'){const f=FORM;closeModal();f.onDel();persist();return render();}
  if(act==='addskill')return editSkill();
  if(act==='addstory')return editStory();
  if(act==='addperson')return editPerson();
  if(act==='editme')return editMe();
  if(act==='skillpreset'){const have=new Set(db.skills.map(x=>x.name));SKILL_PRESET.filter(([n])=>!have.has(n)).forEach(([name,cat])=>db.skills.push({id:uid(),name,cat,level:1,target:4,notes:'',link:''}));persist();render();return toast('已添加，点圆点给自己打分吧');}
  if(act==='theme'){db.theme=db.theme==='dark'?'light':'dark';persist();applyTheme();return render();}
  if(act==='export'){download(`求职进度备份-${today()}.json`,JSON.stringify(db,null,2),'application/json');return toast('备份文件已下载');}
  if(act==='import')return document.getElementById('file').click();
  if(act==='backupnow'){persist();push().then(()=>toast(sync.state==='ok'?'已备份到 '+sync.folder:'备份失败，请从桌面快捷方式重新打开'));return;}
  if(act==='clearsample'){const removed=db.apps.filter(a=>a.sample);db.apps=db.apps.filter(a=>!a.sample);persist();render();return toast(`已清除 ${removed.length} 条示例数据`,['撤销',()=>{db.apps.push(...removed);persist();render();}]);}
  if(act==='icsall'){const L=allEvents().filter(({e})=>e.at&&!e.done&&e.at>=nowLocal());if(!L.length)return toast('没有未来的日程可导出');download(`求职日程-${today()}.ics`,makeICS(L),'text/calendar');return toast(`已导出 ${L.length} 项日程，双击文件即可加入日历`);}
  if(act==='testnotify'){toast('⏰ 这是一条测试提醒');if(typeof Notification!=='undefined'&&Notification.permission==='granted')new Notification('面试提醒',{body:'这是一条测试提醒，到时间会这样通知你'});return;}
 }
 if(T.id==='modal'){if(mkLock())return toast('面试还在进行，点「结束并评分」再关');return closeModal();}
 const atb=T.closest('[data-addtab]');if(atb){addTab=atb.dataset.addtab;return renderAdd();}
 const bst=T.closest('[data-bulkst]');if(bst){bulkSt=bst.dataset.bulkst;return renderAdd();}
 const cm=T.closest('[data-cmd]');if(cm){runCmd(+cm.dataset.cmd);return;}
 const cal=T.closest('[data-cal]');if(cal){calMode=cal.dataset.cal;return render();}
 const mon=T.closest('[data-mon]');if(mon){const d=+mon.dataset.mon;if(d===0){calMonth=new Date();calMonth.setDate(1);}else calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+d,1);return render();}
 const qf=T.closest('[data-qf]');if(qf){qFilter=qf.dataset.qf;return render();}
 const qt=T.closest('[data-qt]');if(qt){qTopic=qTopic===qt.dataset.qt?'':qt.dataset.qt;render();document.querySelector('.tools')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
 const qm=T.closest('[data-qm]');if(qm){const [h,m]=qm.dataset.qm.split('|');db.qmark[h]=db.qmark[h]===m?'':m;if(!db.qmark[h])delete db.qmark[h];persist();return render();}
 const fcb=T.closest('[data-fc]');if(fcb&&FC)return answerFC(fcb.dataset.fc);
 const foc=T.closest('[data-focus]');if(foc){const k=foc.dataset.focus;if(k==='stop'){if(!confirm('放弃这次专注？已经过去的时间不会记录。'))return;FOC=null;localStorage.removeItem('jt_focus');document.title='履迹';renderFocus();return toast('已放弃，没关系，休息好再来');}
  FOC={end:Date.now()+(+k)*6e4,mins:+k};localStorage.setItem('jt_focus',JSON.stringify(FOC));renderFocus();if(db.settings.notify&&typeof Notification!=='undefined'&&Notification.permission==='default')Notification.requestPermission();return toast(`🍅 开始专注 ${k} 分钟，加油`);}
 const rvp=T.closest('[data-rvp]');if(rvp){const [u,o]=rvp.dataset.rvp.split('|');rvU=u;rvO=+o;return render();}
 const dms=T.closest('[data-delms]');if(dms){e.preventDefault();const m=db.milestones.find(x=>x.id===dms.dataset.delms);delWithUndo(db.milestones,m,'这个里程碑');persist();return render();}
 const jdy=T.closest('[data-jday]');if(jdy){jDate=jdy.dataset.jday;render();document.querySelector('main').scrollTo({top:0,behavior:'smooth'});return;}
 const jm=T.closest('[data-jmood]');if(jm){const en=jEntry(jDate,true),m=+jm.dataset.jmood;en.mood=en.mood===m?0:m;persist();return render();}
 const jh=T.closest('[data-jh]');if(jh){const en=jEntry(jDate,true),k=jh.dataset.jh;en.habits[k]=!en.habits[k];persist();render();if(en.habits[k]&&db.habits.every(h=>en.habits[h.id])){toast('🎉 今天的打卡全部完成，给自己点个赞！');confetti();}return;}
 const dhb=T.closest('[data-delhabit]');if(dhb){e.preventDefault();const h=db.habits.find(x=>x.id===dhb.dataset.delhabit);delWithUndo(db.habits,h,`打卡项「${h.name}」`);persist();return render();}
 const lvl=T.closest('[data-lv]');if(lvl){const [id,n]=lvl.dataset.lv.split('|');const x=db.skills.find(y=>y.id===id);x.level=(x.level||0)===+n?+n-1:+n;persist();render();if(x.level>=x.target&&x.target){toast(`🎉 ${x.name} 达到目标水平了！`);confetti(90);}return;}
 const skc=T.closest('[data-skill]');if(skc)return editSkill(db.skills.find(y=>y.id===skc.dataset.skill));
 const bq=T.closest('[data-bq]');if(bq){const q=bq.dataset.bq;return editStory(db.stories.find(y=>(y.qs||[]).includes(q)),q);}
 const sto=T.closest('[data-story]');if(sto)return editStory(db.stories.find(y=>y.id===sto.dataset.story));
 const ctd=T.closest('[data-contacted]');if(ctd){const p=db.people.find(y=>y.id===ctd.dataset.contacted);p.lastAt=today();if(p.nextAt&&p.nextAt<=today())p.nextAt='';persist();render();return toast(`已记录：今天联系了 ${p.name}。可以点这一行设置下次跟进日期`);}
 const per=T.closest('[data-person]');if(per&&!T.closest('[data-open]'))return editPerson(db.people.find(y=>y.id===per.dataset.person));
 const a=openId&&appById(openId);
 const st=T.closest('[data-setst]');if(st&&a){setStatus(a,st.dataset.setst);renderDrawer();render();return;}
 const ae=T.closest('[data-addev]');if(ae&&a){const d=new Date(Date.now()+864e5);const tp=ae.dataset.addev,n=a.events.filter(x=>x.type==='interview').length;
  a.events.push({id:uid(),type:tp,title:tp==='interview'?['一面','二面','三面','四面','五面'][n]||`第${n+1}轮`:'',at:`${dstr(d)}T10:00`,done:false,rating:0,questions:'',review:'',place:''});
  if(tp==='interview'&&['applied','test','wish'].includes(a.status))setStatus(a,'interview');else if(tp==='test'&&['applied','wish'].includes(a.status))setStatus(a,'test');
  touch(a);renderDrawer();render();return;}
 const de=T.closest('[data-delev]');if(de&&a){const i=a.events.findIndex(x=>x.id===de.dataset.delev),[ev]=a.events.splice(i,1);touch(a);renderDrawer();render();toast('已删除这条记录',['撤销',()=>{a.events.splice(i,0,ev);touch(a);if(openId===a.id)renderDrawer();render();}]);return;}
 const ic=T.closest('[data-ics]');if(ic&&a){const ev=a.events.find(x=>x.id===ic.dataset.ics);download(`${a.company}-${ev.title||EV[ev.type]}.ics`,makeICS([{a,e:ev}]),'text/calendar');toast('已下载日历文件，双击即可加入日历');return;}
 const rt=T.closest('[data-rate]');if(rt&&a){const [eid,n]=rt.dataset.rate.split('|');const ev=a.events.find(x=>x.id===eid);ev.rating=ev.rating===+n?0:+n;touch(a);renderDrawer();return;}
 const da=T.closest('[data-delapp]');if(da&&a){const i=db.apps.indexOf(a);db.apps.splice(i,1);persist();closeDrawer();toast(`已删除「${a.company}」`,['撤销',()=>{db.apps.splice(i,0,a);persist();render();}]);return;}
 const op=T.closest('[data-open]');if(op&&!T.closest('input,select,textarea,button,sakuga-button,sakuga-checkbox,sakuga-toggle,sakuga-slider')){e.preventDefault();openDrawer(op.dataset.open);return;}
});
document.getElementById('mask').onclick=closeDrawer;
document.getElementById('bAdd').onclick=()=>openAdd();
document.addEventListener('keydown',e=>{
 const modalOn=document.getElementById('modal').classList.contains('on'),cmd=document.getElementById('cq');
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target.id==='mkA'){e.preventDefault();return mkAnswer();}
 if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.target.id==='chatIn'){e.preventDefault();return chatSend();}
 if(e.key==='Enter'&&!e.isComposing&&e.target.id==='lcU'){e.preventDefault();return lcSave();}
 if(e.key==='Escape'){if(modalOn&&mkLock())return toast('面试还在进行，点「结束并评分」再关');if(modalOn)closeModal();else if(openId)closeDrawer();return;}
 if(modalOn&&cmd){const L=cmdResults();if(e.key==='ArrowDown'){cmdSel=Math.min(L.length-1,cmdSel+1);renderCmdk();e.preventDefault();}else if(e.key==='ArrowUp'){cmdSel=Math.max(0,cmdSel-1);renderCmdk();e.preventDefault();}else if(e.key==='Enter'&&L[cmdSel]){runCmd(cmdSel);}return;}
 if(FC&&modalOn&&e.target.tagName!=='TEXTAREA'){const m={' ':'show','1':'again','2':'hard','3':'good'}[e.key];if(m&&(m==='show')!==FC.show&&FC.list[FC.i]){e.preventDefault();return answerFC(m);}if(m)return;}
 if(e.key==='Enter'&&e.target.id==='msTitle'){document.querySelector('[data-act=addms]')?.click();return;}
 if(e.key==='Enter'&&e.target.id==='newHabit'){const v=e.target.value.trim();if(v){db.habits.push({id:uid(),name:v,icon:'✅'});persist();render();document.getElementById('newHabit')?.focus();}return;}
 if(e.key==='Enter'&&modalOn&&e.target.tagName==='INPUT')return FORM?formSave():saveAdd();
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();return openAdd();}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();return openCmdk();}
 if(!modalOn&&!openId&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&/^[1-9]$/.test(e.key)){view=VIEWS[+e.key-1][0];render();}
});
document.addEventListener('input',e=>{
 const T=e.target;
 if(T.id==='q'){F.q=T.value;F._focus=true;render();return;}
 if(T.id==='qb'){qSearch=T.value;F._focusB=true;render();return;}
 if(T.id==='bulk'){bulkText=T.value;renderBulkPrev();return;}
 if(T.id==='nJD'){const b=document.getElementById('jdBox');b.innerHTML=T.value.trim()?jdHtml(T.value):'';return;}
 if(T.dataset.qnote){db.qnote[T.dataset.qnote]=T.value;persist();return;}
 if(T.dataset.rv){const k=rvU+':'+pRange(rvU,rvO)[0];(db.reviews[k]=db.reviews[k]||{})[T.dataset.rv]=T.value;persist();return;}
 if(T.dataset.j){const en=jEntry(jDate,true);en[T.dataset.j]=T.value;persist();return;}
 if(T.dataset.ffc){T.parentElement.classList.toggle('on',T.checked);return;}
 if(T.id==='cq'){cmdSel=0;renderCmdk();return;}
 if(T.dataset.set==='aiEngine'){db.settings.aiEngine=T.value;persist();toast('已设为首选：'+AI_NAME[T.value]);return;}
 if(T.dataset.set==='digest'){db.settings.digest=T.checked;persist();toast(T.checked?`每天 ${db.settings.digestHour??9}:00 后会收到一条今日汇总`:'已关闭早上的汇总');return;}
 if(T.dataset.set==='digestHour'){db.settings.digestHour=+T.value;persist();return;}
 if(T.dataset.set==='bgNotify'){db.settings.bgNotify=T.checked;persist();toast(T.checked?'关掉履迹窗口后，面试前 1 小时和 15 分钟也会弹 Windows 通知':'已关闭后台提醒');return;}
 if(T.dataset.set==='weekGoal'){db.settings.weekGoal=Math.max(0,+T.value||0);persist();return;}
 const a=openId&&appById(openId);if(!a)return;
 if(T.dataset.f){a[T.dataset.f]=T.dataset.f==='priority'?+T.value:T.value;touch(a);if(T.dataset.f==='company')document.querySelector('.dh h2').textContent=T.value||'未命名公司';renderSoon();return;}
 if(T.dataset.ev){const ev=a.events.find(x=>x.id===T.dataset.ev);ev[T.dataset.ef]=T.type==='checkbox'?T.checked:T.value;touch(a);renderSoon();return;}
 if(T.dataset.of){a.offer[T.dataset.of]=T.value;touch(a);const b=document.getElementById('annual');if(b)b.textContent=fmtK(annual(a.offer));renderSoon();return;}
});
document.addEventListener('change',async e=>{
 const T=e.target;
 if(T.tagName==='SAKUGA-CHECKBOX'&&(T.dataset.done||T.dataset.prep)){const ev=new MouseEvent('click',{bubbles:true});ev.skChange=true;T.dispatchEvent(ev);return;}
 if(T.dataset.jdate){jDate=T.value&&T.value<=today()?T.value:today();return render();}
 if(T.dataset.flt){F[T.dataset.flt]=T.value;F._focus=false;render();return;}
 if(T.dataset.set==='notify'){if(T.checked&&typeof Notification!=='undefined'&&Notification.permission!=='granted'){const p=await Notification.requestPermission();if(p!=='granted'){T.checked=false;toast('没有获得通知权限，仍会在应用内提醒');}}db.settings.notify=T.checked;persist();render();return;}
 if(openId&&(T.tagName==='SELECT'||T.type==='checkbox'||T.type==='date'||T.type==='datetime-local'||['link','site','place','notes'].includes(T.dataset.f||T.dataset.ef)))renderDrawer();
});
document.addEventListener('focusout',e=>{if(e.target.id==='q')F._focus=false;if(e.target.id==='qb')F._focusB=false;});
let dragId=null;
document.addEventListener('dragstart',e=>{const c=e.target.closest?.('.kc');if(!c)return;dragId=c.dataset.id;c.classList.add('drag');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragId);});
document.addEventListener('dragend',e=>{e.target.closest?.('.kc')?.classList.remove('drag');document.querySelectorAll('.col.over').forEach(c=>c.classList.remove('over'));});
document.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(!c||!dragId)return;e.preventDefault();document.querySelectorAll('.col.over').forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over');});
document.addEventListener('drop',e=>{const c=e.target.closest('.col');if(!c||!dragId)return;e.preventDefault();const a=appById(dragId);dragId=null;if(a&&a.status!==c.dataset.col){const old=a.status;setStatus(a,c.dataset.col);if(c.dataset.col!=='offer')skHit(e.clientX,e.clientY,'zuza');if(c.dataset.col!=='offer')toast(`${a.company} → ${SM[a.status].n}`,['撤销',()=>{setStatus(a,old);render();}]);}render();});
document.getElementById('file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);const data=d.data&&Array.isArray(d.data.apps)?d.data:d;if(!Array.isArray(data.apps))throw 0;
 if(db.apps.length&&!confirm(`导入 ${data.apps.length} 条记录，将替换当前的 ${db.apps.length} 条。继续？`))return;
 const prev=db;db=normalize(data);persist();applyTheme();render();toast(`已导入 ${db.apps.length} 条记录`,['撤销',()=>{db=prev;persist();applyTheme();render();}]);}catch{toast('文件格式不对，导入失败');}};r.readAsText(f);e.target.value='';};
function applyTheme(){document.documentElement.dataset.theme=db.theme==='dark'?'dark':'light';const b=document.getElementById('themeBtn');if(b)b.textContent=db.theme==='dark'?'☀️ 浅色模式':'🌙 深色模式';}


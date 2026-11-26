// 履迹助手 · 在 Boss直聘 网页上运行
// 1. 你点「立即沟通 / 投递」时，把这个岗位记到履迹（已投递）
// 2. 聊天里出现面试邀请时，交给履迹识别成日程
// 3. 左下角的小按钮可以把正在看的岗位先收藏到履迹
// 只读取你正在看的页面，不会替你点任何按钮，也不会访问 Boss 的接口。
(() => {
  if (window.__lvji) return; window.__lvji = true;
  const T = el => (el && (el.innerText || el.textContent) || '').trim();
  const first = s => s.split('\n')[0].trim();
  const q = (sels, root = document) => { for (const s of sels.split('|')) { try { const e = root.querySelector(s); const t = T(e); if (t) return first(t); } catch {} } return ''; };
  const CT = '北京 上海 广州 深圳 杭州 南京 成都 武汉 西安 苏州 天津 重庆 长沙 厦门 合肥 郑州 青岛 济南 大连 珠海 东莞 佛山 宁波 无锡 福州 昆明 沈阳 哈尔滨 香港 新加坡 远程'.split(' ');
  const cityOf = s => CT.find(c => (s || '').includes(c)) || '';
  const sal = s => /\d/.test(s || '') ? s.replace(/[-]/g, '').slice(0, 40) : ''; // Boss 列表页薪资用了加密字体，读不出就留空
  const CARD = '.job-card-box,.job-card-wrapper,.job-card-wrap,[class*=job-card]';
  const send = (item, key, manual) => new Promise(res => { try { chrome.runtime.sendMessage({ type: 'record', item, key, manual }, r => res(r || { ok: false, why: chrome.runtime.lastError?.message || '' })); } catch (e) { res({ ok: false, why: '扩展已更新，请刷新这个页面' }); } });

  // ---------- 读取岗位信息 ----------
  function fromCard(c) {
    const a = c.querySelector('a[href*="job_detail"]');
    return { role: q('.job-name|.job-title|[class*=job-name]|[class*=job-title]', c), company: q('.boss-name|.company-name|.company-info .name|[class*=company-name]|[class*=boss-name]', c),
      salary: sal(q('.job-salary|.salary|[class*=salary]', c)), city: cityOf(q('.company-location|.job-area|[class*=location]|[class*=area]', c)), link: a ? a.href : '' };
  }
  function jobInfo(btn) {
    const card = btn && btn.closest(CARD);
    if (card && card.querySelector('.job-name,.job-title,[class*=job-name]')) return { ...fromCard(card), jd: '' };
    const pane = (btn && btn.closest('.job-detail-box,.job-detail-container,.job-detail,.job-banner')) || document;
    const active = document.querySelector('.job-card-box.active,[class*=job-card][class*=active],[class*=job-card][class*=selected]');
    const A = active ? fromCard(active) : {};
    const role = q('.job-banner .name h1|.job-banner h1|.job-detail-box .job-name|.job-detail-header .job-name|.job-name|h1', pane) || A.role || '';
    let company = q('.sider-company .company-info a[title]|.job-detail-box .company-info .name|.job-detail-box [class*=company-name]|.company-info .name|[class*=company-name]') || A.company || '';
    if (!company) { const p = document.title.split(/[_|｜\-–—]/).map(s => s.replace(/招聘|「|」|【|】/g, '').trim()).filter(s => s && !/BOSS|直聘/i.test(s)); company = p[1] || ''; }
    let jd = '';
    for (const s of ['.job-sec-text', '.job-detail-box .desc', '.job-detail-section', '.job-description']) { const t = T(pane.querySelector(s) || document.querySelector(s)); if (t.length > 20) { jd = t; break; } }
    const link = /job_detail/.test(location.href) ? location.href.split('?')[0] : (A.link || (document.querySelector('.job-detail-box a[href*="job_detail"]') || {}).href || '');
    return { role, company, jd: jd.slice(0, 6000), link,
      salary: sal(q('.job-banner .salary|.job-detail-box .job-salary|.job-salary|.salary', pane)) || A.salary || '',
      city: cityOf(q('.text-city|.job-detail-box .job-address-desc|.job-city|.job-area|[class*=location]', pane)) || A.city || cityOf(document.title),
      hr: q('.job-boss-info .name|.job-detail-box .boss-info .name|.boss-info-attr', pane) || q('.job-boss-info .name|.job-detail-box .boss-info .name|.boss-info-attr') };
  }
  const keyOf = j => 'job|' + (j.link || (j.company + '|' + j.role));

  // ---------- 1. 点「立即沟通」自动记录 ----------
  const APPLY = /^(立即沟通|投递简历|立即投递|申请职位|立即申请|发送简历)$/;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('a,button,[role=button],[class*=btn],[class*=startchat]');
    if (!b) return;
    const t = T(b).replace(/\s+/g, '');
    if (!APPLY.test(t)) return;
    const j = jobInfo(b);
    if (!j.company && !j.role) return;
    setTimeout(async () => {
      const r = await send({ kind: 'job', status: 'applied', channel: 'Boss直聘', ...j }, keyOf(j) + '|applied');
      if (r.ok && !r.dup) chip.flash(`✓ 已记到履迹：${j.company || ''} · ${j.role || ''}`);
      else if (!r.ok && r.why !== 'off') chip.flash(r.why === '未配对' ? '履迹还没连上：先打开一次履迹' : '没记上：' + (r.why || '履迹没开'), true);
    }, 300);
  }, true);

  // ---------- 2. 聊天里的面试邀请 ----------
  const INV = /面试|笔试|测评|[一二三四终复初]面|技术面|hr ?面|主管面|面一下|腾讯会议|飞书会议|会议号|zoom/i;
  const WHEN = /(\d{1,2}\s*[:：点]|\d{1,2}\s*月\s*\d{1,2}|\d{1,2}[/-]\d{1,2}|明天|后天|今天|周[一二三四五六日天]|星期[一二三四五六日天])/;
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) | 0; return (h >>> 0).toString(36); };
  let box = null, obs = null, timer = 0;
  function chatHead() {
    return { company: q('.chat-conversation .top-info .company|[class*=top-info] [class*=company]|.base-info [class*=company]|.name-box .company'),
      hr: q('.chat-conversation .top-info .name|[class*=top-info] .name|.base-info .name'),
      role: q('.chat-conversation .top-info .position|[class*=top-info] [class*=position]|.base-info [class*=position]|.position-name') };
  }
  function checkChat() {
    if (!box || !document.contains(box)) return;
    const all = T(box); const recent = all.slice(-800);
    // 按行找：同一行既提到面试又有时间，才算邀请
    const lines = recent.split('\n').map(s => s.trim()).filter(Boolean);
    const hit = lines.reverse().find(l => INV.test(l) && WHEN.test(l));
    if (!hit) return;
    const h = chatHead();
    send({ kind: 'chat', channel: 'Boss直聘', ...h, text: all.slice(-3000) }, 'inv|' + h.company + '|' + hash(hit)).then(r => {
      if (r.ok && !r.dup) chip.flash(`📅 发现${h.company ? ' ' + h.company + ' 的' : ''}面试邀请，已交给履迹建日程`);
    });
  }
  setInterval(() => {
    if (!/chat/.test(location.pathname)) { if (obs) { obs.disconnect(); obs = null; box = null; } return; }
    let b = null;
    for (const s of ['.chat-conversation .chat-message', '.chat-message-list', '.message-list', '.chat-record', '[class*=message-list]', '.chat-conversation']) { const e = document.querySelector(s); if (e && T(e).length > 10) { b = e; break; } }
    if (b && b !== box) { if (obs) obs.disconnect(); box = b; obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(checkChat, 1200); }); obs.observe(b, { childList: true, subtree: true, characterData: true }); setTimeout(checkChat, 800); }
  }, 2000);

  // ---------- 3. 左下角小按钮 ----------
  const chip = (() => {
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:2147483646';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      .c{font:600 13px/1 "Microsoft YaHei UI",system-ui,sans-serif;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;background:#16161d;color:#fff;border:2px solid #16161d;box-shadow:3px 3px 0 #ff2d87;cursor:pointer;user-select:none;transition:transform .15s}
      .c:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #ff2d87}.c.min{padding:8px}.c.min span{display:none}
      .c.err{box-shadow:3px 3px 0 #f59e0b}.d{width:8px;height:8px;border-radius:50%;background:#ff2d87;flex:none}
      .x{opacity:.6;margin-left:2px;font-weight:400}.x:hover{opacity:1}</style>
      <div class="c" title="履迹助手"><i class="d"></i><span class="t">收藏到履迹</span><span class="x" title="收起">×</span></div>`;
    const c = root.querySelector('.c'), t = root.querySelector('.t');
    let restore = 0;
    const isJobPage = () => !/chat/.test(location.pathname) && !!document.querySelector('.job-banner,.job-detail-box,.job-detail-container,.job-sec-text');
    const refresh = () => { host.style.display = isJobPage() || restore ? '' : 'none'; };
    root.querySelector('.x').onclick = ev => { ev.stopPropagation(); c.classList.toggle('min'); };
    c.onclick = async () => {
      if (c.classList.contains('min')) return c.classList.remove('min');
      const j = jobInfo(document.querySelector('.job-detail-box,.job-banner,.job-detail-container'));
      if (!j.company && !j.role) return flash('这个页面没认出岗位', true);
      const r = await send({ kind: 'job', status: 'wish', channel: 'Boss直聘', ...j }, keyOf(j) + '|wish', true);
      flash(r.ok ? (r.dup ? '这个岗位已经在履迹里了' : `✓ 已收藏：${j.company} · ${j.role}`) : (r.why === '未配对' ? '履迹还没连上：先打开一次履迹' : '没记上：' + (r.why || '履迹没开')), !r.ok);
    };
    function flash(msg, err) {
      clearTimeout(restore); c.classList.remove('min'); c.classList.toggle('err', !!err); t.textContent = msg; host.style.display = '';
      restore = setTimeout(() => { restore = 0; t.textContent = '收藏到履迹'; c.classList.remove('err'); refresh(); }, 4000);
    }
    const mount = () => { if (!document.body) return setTimeout(mount, 300); document.body.appendChild(host); refresh(); setInterval(refresh, 1500); };
    mount();
    return { flash };
  })();
})();

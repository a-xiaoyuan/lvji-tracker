// 履迹助手 · 各招聘网站共用的小工具：读文字、发给履迹、左下角小按钮
// 只读取你正在看的页面，不会替你点任何按钮。
(() => {
  if (window.LV) return;
  const T = el => (el && (el.innerText || el.textContent) || '').trim();
  const first = s => s.split('\n')[0].trim();
  const q = (sels, root = document) => { for (const s of sels.split('|')) { try { const e = root.querySelector(s); const t = T(e); if (t) return first(t); } catch {} } return ''; };
  const CT = '北京 上海 广州 深圳 杭州 南京 成都 武汉 西安 苏州 天津 重庆 长沙 厦门 合肥 郑州 青岛 济南 大连 珠海 东莞 佛山 宁波 无锡 福州 昆明 沈阳 哈尔滨 香港 新加坡 远程'.split(' ');
  const cityOf = s => CT.find(c => (s || '').includes(c)) || '';
  const send = (item, key, manual) => new Promise(res => { try { chrome.runtime.sendMessage({ type: 'record', item, key, manual }, r => res(r || { ok: false, why: chrome.runtime.lastError?.message || '' })); } catch (e) { res({ ok: false, why: '扩展已更新，请刷新这个页面' }); } });
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) | 0; return (h >>> 0).toString(36); };
  const whyText = r => r.why === '未配对' ? '履迹还没连上：先打开一次履迹' : '没记上：' + (r.why || '履迹没开');

  // 左下角小按钮。isJobPage：什么时候显示；getJob：点击时读取岗位；channel：渠道名
  function makeChip({ isJobPage, getJob, channel }) {
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
    const refresh = () => { host.style.display = isJobPage() || restore ? '' : 'none'; };
    root.querySelector('.x').onclick = ev => { ev.stopPropagation(); c.classList.toggle('min'); };
    c.onclick = async () => {
      if (c.classList.contains('min')) return c.classList.remove('min');
      const j = getJob();
      if (!j.company && !j.role) return flash('这个页面没认出岗位', true);
      const r = await send({ kind: 'job', status: 'wish', channel, ...j }, 'job|' + (j.link || j.company + '|' + j.role) + '|wish', true);
      flash(r.ok ? (r.dup ? '这个岗位已经在履迹里了' : `✓ 已收藏：${j.company} · ${j.role}`) : whyText(r), !r.ok);
    };
    function flash(msg, err) {
      clearTimeout(restore); c.classList.remove('min'); c.classList.toggle('err', !!err); t.textContent = msg; host.style.display = '';
      restore = setTimeout(() => { restore = 0; t.textContent = '收藏到履迹'; c.classList.remove('err'); refresh(); }, 4000);
    }
    const mount = () => { if (!document.body) return setTimeout(mount, 300); document.body.appendChild(host); refresh(); setInterval(refresh, 1500); };
    mount();
    return { flash };
  }

  window.LV = { T, first, q, cityOf, send, hash, whyText, makeChip };
})();

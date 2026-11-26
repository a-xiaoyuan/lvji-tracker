const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = t => new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
chrome.storage.local.get(['diagLog'], ({ diagLog = [] }) => {
  const L = diagLog.filter(d => Date.now() - d.at < 14 * 864e5);
  if (!L.length) return;
  $('diagSec').hidden = false;
  $('diag').innerHTML = L.slice(0, 5).map(d => `<div class="r"><b>${esc(d.site)}</b> · ${esc(d.stage)}<span style="float:right">${when(d.at)}</span><br><span class="t2">${esc(d.why)}</span></div>`).join('');
  $('diagCopy').onclick = async e => {
    e.preventDefault();
    const text = `履迹助手 ${chrome.runtime.getManifest().version} 诊断信息\n` + L.map(d => `${new Date(d.at).toISOString()} | ${d.site} | ${d.stage} | ${d.why} | ${d.url}`).join('\n');
    try { await navigator.clipboard.writeText(text); $('diagCopy').textContent = '✓ 已复制'; } catch { $('diagCopy').textContent = '复制失败'; }
  };
});
chrome.storage.local.get(['autoApply', 'autoInvite', 'recent'], o => {
  for (const k of ['autoApply', 'autoInvite']) { $(k).checked = o[k] !== false; $(k).onchange = () => chrome.storage.local.set({ [k]: $(k).checked }); }
  const R = o.recent || [];
  if (R.length) $('rec').innerHTML = R.slice(0, 6).map(r => `<div class="r">${r.kind === 'chat' ? '📅 面试邀请' : r.status === 'wish' ? '☆ 收藏' : '✓ 投递'} · ${esc(r.company || '')}${r.role ? ' · ' + esc(r.role) : ''}<span style="float:right">${new Date(r.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('');
});
chrome.runtime.sendMessage({ type: 'status' }, s => {
  s = s || {};
  const line = (ok, t) => `<div class="st"><i class="dot ${ok ? 'ok' : 'bad'}"></i>${t}</div>`;
  $('st').innerHTML = !s.helper
    ? line(false, '履迹没在运行') + '<div class="t2">双击桌面上的「履迹」打开它，之后就能自动记录了。</div>'
    : !s.paired
      ? line(false, '还没和履迹连上') + '<div class="t2">在这个浏览器里打开一次 <a href="http://127.0.0.1:47321/jobs/" target="_blank">履迹</a> 就会自动连上。用桌面快捷方式打开的履迹也算（同一个 Edge）。</div>'
      : line(true, '已连上履迹') + '<div class="t2">去 Boss直聘 正常投递就行，左下角会提示记录结果。</div>';
});

// 履迹助手后台：只和本机的履迹助手（127.0.0.1:47321）通信
const API = 'http://127.0.0.1:47321/api';
const get = k => chrome.storage.local.get(k);

async function call(path, body) {
  const { token } = await get('token');
  if (!token) throw new Error('未配对');
  const r = await fetch(API + path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', 'x-token': token }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401) { await chrome.storage.local.remove('token'); throw new Error('未配对'); }
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// 同一个岗位 / 同一条邀请只记一次（保留 60 天）
async function seen(key) {
  const { seenKeys = {} } = await get('seenKeys');
  const now = Date.now();
  for (const k in seenKeys) if (now - seenKeys[k] > 60 * 864e5) delete seenKeys[k];
  if (seenKeys[key]) return true;
  seenKeys[key] = now; await chrome.storage.local.set({ seenKeys });
  return false;
}

async function log(entry) {
  const { recent = [] } = await get('recent');
  recent.unshift({ ...entry, at: Date.now() });
  await chrome.storage.local.set({ recent: recent.slice(0, 15) });
}

// 自检记录：没记上的情况（网站改版认不出页面、履迹没开、没配对……）记下来，扩展弹窗和履迹设置里都能看到，方便定位
// 只记网站名、哪一步、原因和不带参数的网址，不记页面内容
async function diag(e) {
  const { diagLog = [] } = await get('diagLog');
  const now = Date.now(), url = String(e.url || '').split(/[?#]/)[0].slice(0, 200);
  // 同一个网站、同一步、同一个原因 6 小时内只记一次
  if (diagLog.some(x => x.site === e.site && x.stage === e.stage && x.why === e.why && now - x.at < 6 * 3600e3)) return;
  diagLog.unshift({ at: now, site: String(e.site || ''), stage: String(e.stage || '').slice(0, 40), why: String(e.why || '').slice(0, 200), url });
  await chrome.storage.local.set({ diagLog: diagLog.slice(0, 20) });
  hello().catch(() => {});
}
async function hello() {
  const { diagLog = [] } = await get('diagLog');
  return call('/ext/hello', { v: chrome.runtime.getManifest().version, diag: diagLog.slice(0, 10) });
}

chrome.runtime.onMessage.addListener((m, sender, reply) => {
  (async () => {
    if (m.type === 'pair') {
      const { token } = await get('token');
      if (m.token && m.token !== token) await chrome.storage.local.set({ token: m.token });
      hello().catch(() => {});
      return { ok: true };
    }
    if (m.type === 'miss') { await diag({ ...m, url: m.url || sender.tab?.url }); return { ok: true }; }
    if (m.type === 'record') {
      const opts = await get(['autoApply', 'autoInvite']);
      if (m.item.kind === 'job' && opts.autoApply === false && !m.manual) return { ok: false, why: 'off' };
      if (m.item.kind === 'chat' && opts.autoInvite === false) return { ok: false, why: 'off' };
      if (m.key && await seen(m.key)) return { ok: true, dup: true };
      try { await call('/inbox', { ...m.item, auto: '1' }); }
      catch (e) {
        // 没送到：把「已经记过」的标记撤掉，下次还能再记；并写进自检记录
        const { seenKeys = {} } = await get('seenKeys'); if (m.key) { delete seenKeys[m.key]; await chrome.storage.local.set({ seenKeys }); }
        const why = e.message === '未配对' ? '扩展还没和履迹连上（打开一次履迹就好）' : /fetch/i.test(e.message) ? '履迹没在运行' : e.message;
        await diag({ site: m.item.channel || '', stage: m.item.kind === 'chat' ? '面试邀请' : '记录岗位', why: `${why}：${m.item.company || ''} ${m.item.role || ''}`.trim(), url: sender.tab?.url });
        throw e;
      }
      await log({ kind: m.item.kind, company: m.item.company, role: m.item.role, status: m.item.status });
      return { ok: true };
    }
    if (m.type === 'status') {
      const { token } = await get('token');
      let helper = false; try { helper = (await fetch(API + '/health')).ok; } catch {}
      let paired = false; if (token && helper) { try { await hello(); paired = true; } catch {} }
      return { helper, paired };
    }
  })().then(reply, e => reply({ ok: false, why: e.message }));
  return true;
});

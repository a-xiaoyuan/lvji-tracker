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

chrome.runtime.onMessage.addListener((m, sender, reply) => {
  (async () => {
    if (m.type === 'pair') {
      const { token } = await get('token');
      if (m.token && m.token !== token) await chrome.storage.local.set({ token: m.token });
      call('/ext/hello', { v: chrome.runtime.getManifest().version }).catch(() => {});
      return { ok: true };
    }
    if (m.type === 'record') {
      const opts = await get(['autoApply', 'autoInvite']);
      if (m.item.kind === 'job' && opts.autoApply === false && !m.manual) return { ok: false, why: 'off' };
      if (m.item.kind === 'chat' && opts.autoInvite === false) return { ok: false, why: 'off' };
      if (m.key && await seen(m.key)) return { ok: true, dup: true };
      await call('/inbox', { ...m.item, auto: '1' });
      await log({ kind: m.item.kind, company: m.item.company, role: m.item.role, status: m.item.status });
      return { ok: true };
    }
    if (m.type === 'status') {
      const { token } = await get('token');
      let helper = false; try { helper = (await fetch(API + '/health')).ok; } catch {}
      let paired = false; if (token && helper) { try { await call('/ext/hello', { v: chrome.runtime.getManifest().version }); paired = true; } catch {} }
      return { helper, paired };
    }
  })().then(reply, e => reply({ ok: false, why: e.message }));
  return true;
});

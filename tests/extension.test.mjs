// 浏览器扩展的后台脚本：去重、失败时写自检记录、送不到时下次还能再记
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT } from './extract.mjs';

function boot({ online = true, token = 't' } = {}) {
  const store = { token }, calls = [];
  let handler;
  const chrome = {
    storage: { local: {
      get: async k => { const ks = Array.isArray(k) ? k : [k]; return Object.fromEntries(ks.filter(x => x in store).map(x => [x, structuredClone(store[x])])); },
      set: async o => { Object.assign(store, structuredClone(o)); },
      remove: async k => { delete store[k]; },
    } },
    runtime: { onMessage: { addListener: f => { handler = f; } }, getManifest: () => ({ version: '9.9.9' }) },
  };
  const fetch = async (url, o = {}) => {
    calls.push({ url, body: o.body && JSON.parse(o.body) });
    if (!online) throw new TypeError('Failed to fetch');
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'extension', 'background.js'), 'utf8'), { chrome, fetch, console, structuredClone });
  const msg = (m, tab = { url: 'https://www.zhipin.com/job_detail/abc.html?ka=x' }) => new Promise(r => handler(m, { tab }, v => r(JSON.parse(JSON.stringify(v)))));
  return { store, calls, msg };
}
const job = { kind: 'job', status: 'applied', channel: 'Boss直聘', company: '星河云', role: 'Java开发' };

test('同一个岗位只记一次', async () => {
  const x = boot();
  assert.deepEqual(await x.msg({ type: 'record', item: job, key: 'k1' }), { ok: true });
  assert.deepEqual(await x.msg({ type: 'record', item: job, key: 'k1' }), { ok: true, dup: true });
  assert.equal(x.calls.filter(c => c.url.endsWith('/inbox')).length, 1);
  assert.equal(x.store.recent.length, 1);
});

test('履迹没开：写进自检记录，并且下次还能再记', async () => {
  const x = boot({ online: false });
  const r = await x.msg({ type: 'record', item: job, key: 'k2' });
  assert.equal(r.ok, false);
  assert.equal(x.store.diagLog.length, 1);
  assert.match(x.store.diagLog[0].why, /履迹没在运行/);
  assert.equal(x.store.diagLog[0].url, 'https://www.zhipin.com/job_detail/abc.html', '网址去掉了参数');
  assert.ok(!x.store.seenKeys?.k2, '没送到就不算记过');
});

test('没配对：提示先打开履迹', async () => {
  const x = boot({ token: '' });
  const r = await x.msg({ type: 'record', item: job, key: 'k3' });
  assert.equal(r.ok, false);
  assert.match(x.store.diagLog[0].why, /没和履迹连上/);
});

test('页面没认出：同样的问题 6 小时内只记一次，并带给履迹', async () => {
  const x = boot();
  const m = { type: 'miss', site: 'Boss直聘', stage: '读取岗位页', why: '岗位页上没认出：公司' };
  await x.msg(m); await x.msg(m);
  assert.equal(x.store.diagLog.length, 1);
  const hello = x.calls.filter(c => c.url.endsWith('/ext/hello')).pop();
  assert.equal(hello.body.v, '9.9.9');
  assert.equal(hello.body.diag[0].stage, '读取岗位页');
});

test('自动记录关掉后不记（手动收藏照样能记）', async () => {
  const x = boot();
  x.store.autoApply = false;
  assert.deepEqual(await x.msg({ type: 'record', item: job, key: 'k4' }), { ok: false, why: 'off' });
  assert.deepEqual(await x.msg({ type: 'record', item: { ...job, status: 'wish' }, key: 'k5', manual: true }), { ok: true });
});

test('扩展清单：四个招聘网站都挂了内容脚本，文件都在', () => {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'extension', 'manifest.json'), 'utf8'));
  const hosts = m.content_scripts.flatMap(c => c.matches).join(' ');
  for (const h of ['zhipin.com', 'nowcoder.com', 'zhaopin.com', '51job.com']) assert.ok(hosts.includes(h), '清单里缺 ' + h);
  for (const c of m.content_scripts) for (const f of c.js) assert.ok(fs.existsSync(path.join(ROOT, 'extension', f)), '清单里的文件不存在：' + f);
});

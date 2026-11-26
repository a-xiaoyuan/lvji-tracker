// 本机服务 helper/server.mjs：在临时目录、临时端口上真的启动一份，测接口。
// 不会碰真实数据：数据目录、密钥文件都指到系统临时目录里，测完删掉。
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from './extract.mjs';

const PORT = 47500 + Math.floor(Math.random() * 400);
const BASE = `http://127.0.0.1:${PORT}`;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lvji-test-'));
const DATA = path.join(TMP, 'data'), STATE = path.join(TMP, 'state');
fs.mkdirSync(DATA); fs.mkdirSync(STATE);
const TOKEN = 'a'.repeat(48);
fs.writeFileSync(path.join(STATE, 'token.txt'), TOKEN);

let srv;
test.before(async () => {
  srv = spawn(process.execPath, [path.join(ROOT, 'helper', 'server.mjs')], {
    env: { ...process.env, LVJI_PORT: String(PORT), LVJI_DATA_DIR: DATA, LVJI_STATE_DIR: STATE, LVJI_NO_NOTIFY: '1', DEEPSEEK_API_KEY: '' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE + '/api/health')).ok) return; } catch {} await new Promise(r => setTimeout(r, 100)); }
  throw new Error('测试用的本机服务没启动起来');
});
test.after(() => { srv?.kill(); fs.rmSync(TMP, { recursive: true, force: true }); });

const H = { 'content-type': 'application/json', 'x-token': TOKEN };
const put = (body, headers = H) => fetch(BASE + '/api/jobtracker', { method: 'PUT', headers, body: JSON.stringify(body) });
const doc = (savedAt, apps, base) => ({ savedAt, ...(base === undefined ? {} : { base }), data: { apps } });

test('没有密钥或密钥不对：拒绝读写数据', async () => {
  assert.equal((await fetch(BASE + '/api/jobtracker')).status, 401);
  assert.equal((await fetch(BASE + '/api/jobtracker', { headers: { 'x-token': 'b'.repeat(48) } })).status, 401);
  assert.equal((await put(doc(1, []), { 'content-type': 'application/json' })).status, 401);
});

test('格式不对的数据不保存', async () => {
  assert.equal((await put({ savedAt: 'x', data: { apps: [] } })).status, 400);
  assert.equal((await put({ savedAt: 1, data: {} })).status, 400);
});

test('保存后能读回来，并写了当天备份', async () => {
  assert.equal((await put(doc(1000, [{ id: '1', company: '星河云' }]))).status, 200);
  const j = await (await fetch(BASE + '/api/jobtracker', { headers: H })).json();
  assert.equal(j.savedAt, 1000); assert.equal(j.data.apps[0].company, '星河云');
  assert.ok(fs.readdirSync(path.join(DATA, '每日备份')).some(f => f.endsWith('.json')));
});

test('防覆盖：别的窗口存过新版本时，旧版本的保存被拒绝并拿到新版本', async () => {
  // 窗口 A、B 都基于 2000 版本
  assert.equal((await put(doc(2000, [{ id: '1' }]))).status, 200);
  assert.equal((await put(doc(2100, [{ id: '1' }, { id: 'A' }], 2000))).status, 200); // A 先存
  const r = await put(doc(2050, [{ id: '1' }, { id: 'B' }], 2000));               // B 后存，基于旧版本
  assert.equal(r.status, 409);
  const j = await r.json();
  assert.equal(j.savedAt, 2100); assert.deepEqual(j.data.apps.map(a => a.id), ['1', 'A']);
  // B 合并后基于 2100 再存：成功
  assert.equal((await put(doc(2200, [{ id: '1' }, { id: 'A' }, { id: 'B' }], 2100))).status, 200);
});

test('防覆盖：同一份重复发送不算冲突；旧版页面（不带 base）照常保存', async () => {
  assert.equal((await put(doc(2200, [{ id: '1' }], 2000))).status, 200);
  assert.equal((await put(doc(2300, [{ id: '1' }]))).status, 200);
});

test('防覆盖：两个请求同时到，只有一个能通过', async () => {
  const [a, b] = await Promise.all([put(doc(3001, [{ id: 'x' }], 2300)), put(doc(3002, [{ id: 'y' }], 2300))]);
  assert.deepEqual([a.status, b.status].sort(), [200, 409]);
});

test('静态文件：不能用 ../ 跳出程序目录', async () => {
  const r = await fetch(BASE + '/jobs/..%2f..%2fhelper%2ftoken.txt');
  assert.ok([403, 404].includes(r.status));
  assert.equal((await fetch(BASE + '/jobs/')).status, 200);
});

test('收件箱：同源或带密钥才能放东西；取走后能删除', async () => {
  const bad = await fetch(BASE + '/api/inbox', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example' }, body: JSON.stringify({ company: 'X' }) });
  assert.equal(bad.status, 403);
  const ok = await fetch(BASE + '/api/inbox', { method: 'POST', headers: H, body: JSON.stringify({ company: '北辰数据', role: '服务端开发', kind: 'job' }) });
  assert.equal(ok.status, 200);
  const list = await (await fetch(BASE + '/api/inbox', { headers: H })).json();
  const items = Array.isArray(list) ? list : list.items;
  assert.equal(items.length, 1); assert.equal(items[0].company, '北辰数据');
  await fetch(BASE + '/api/inbox', { method: 'DELETE', headers: H, body: JSON.stringify({ ids: [items[0].id] }) });
  const after = await (await fetch(BASE + '/api/inbox', { headers: H })).json();
  assert.equal((Array.isArray(after) ? after : after.items).length, 0);
});

test('Agent 额度默认关闭，打开后才读取', async () => {
  assert.deepEqual(await (await fetch(BASE + '/api/agent', { headers: H })).json(), { off: true });
  const on = await (await fetch(BASE + '/api/agent/enable', { method: 'POST', headers: H, body: JSON.stringify({ on: true }) })).json();
  assert.equal(on.on, true);
  const off = await (await fetch(BASE + '/api/agent/enable', { method: 'POST', headers: H, body: JSON.stringify({ on: false }) })).json();
  assert.equal(off.on, false);
  assert.ok(!fs.existsSync(path.join(STATE, 'agent-on.txt')));
});

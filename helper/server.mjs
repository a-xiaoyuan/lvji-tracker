// 本机小助手：只监听 127.0.0.1
//  - 静态托管「如页」简历编辑器（WASM 排版引擎需要 http 才能运行）
//  - 为「求职进度」提供自动备份接口，数据写到 文档\求职进度\
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { agentUsage } from './agent-usage.mjs';
import { othersUsage } from './agents-more.mjs';
import { runAI, aiStatus, setDeepseekKey } from './ai.mjs';
import { lcSync } from './leetcode.mjs';

const PORT = 47321;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUYE = path.resolve(HERE, '..', 'Ruye');
const JOBS = path.resolve(HERE, '..', 'JobTracker');
const DATA_DIR = path.join(os.homedir(), 'Documents', '求职进度');
const DATA_FILE = path.join(DATA_DIR, 'jobtracker-data.json');
const BACKUP_DIR = path.join(DATA_DIR, '每日备份');
const TOKEN_FILE = path.join(HERE, 'token.txt');
const KEEP_BACKUPS = 30;
const INBOX_FILE = path.join(DATA_DIR, 'inbox.json');
const RUYE_FILE = path.join(DATA_DIR, 'ruye-resumes.json');
const RUYE_BAK = path.join(BACKUP_DIR, '简历');
const SELF = `http://127.0.0.1:${PORT}`;
const AGENT_FILE = path.join(HERE, 'agent-usage.json');
const SNAP_DIR = path.join(BACKUP_DIR, '恢复前');
const EXT_DIR = path.resolve(HERE, '..', 'extension'); // 浏览器扩展「履迹助手」
let extSeen = 0, extVer = '';
let lastSeen = 0; // 履迹页面最后一次带密钥访问的时间，用来判断窗口是否开着

/* ---------- 履迹关着时的面试提醒（Windows 通知） ---------- */
const EVN = { interview: '面试', test: '笔试/测评', followup: '跟进', offer: 'Offer 沟通', note: '备注' };
const sentRem = new Set();
function winToast(title, body, url = '') {
  try {
    const ch = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', path.join(HERE, 'toast.ps1')],
      { env: { ...process.env, LVJI_TITLE: title, LVJI_BODY: body, LVJI_URL: url }, windowsHide: true, stdio: 'ignore' });
    ch.on('error', () => {});
  } catch {}
}
async function checkReminders() {
  if (Date.now() - lastSeen < 150e3) return; // 窗口开着时由页面自己提醒
  let j; try { j = JSON.parse(await fsp.readFile(DATA_FILE, 'utf8')); } catch { return; }
  const d = j && j.data; if (!d || d.settings?.bgNotify === false) return;
  const now = Date.now();
  for (const a of d.apps || []) for (const e of a.events || []) {
    if (e.done || !e.at) continue;
    const mins = (new Date(e.at).getTime() - now) / 6e4;
    for (const w of [60, 15]) {
      if (!(mins > 0 && mins <= w)) continue;
      const k = `${e.id}|${e.at}|${w}`; if (sentRem.has(k)) break; sentRem.add(k);
      winToast(`${a.company || '面试'} · ${e.title || EVN[e.type] || '日程'}`, `${Math.max(1, Math.round(mins))} 分钟后开始${e.place ? ' · ' + e.place : ''}（${a.role || ''}）`);
      break;
    }
  }
  // 面试结束 1～3 小时后还没复盘：提醒一次
  for (const a of d.apps || []) for (const e of a.events || []) {
    if (e.type !== 'interview' || !e.at || e.review || e.questions || e.rvAsked) continue;
    const ago = (now - new Date(e.at).getTime()) / 6e4, k = `rv|${e.id}|${e.at}`;
    if (ago < 60 || ago > 180 || sentRem.has(k)) continue; sentRem.add(k);
    winToast(`${a.company || '面试'} 的${e.title || '面试'}结束了`, '趁记得清楚，打开履迹做个 3 步复盘：感觉、问了什么、哪里没答好', `${SELF}/jobs/`);
  }
}
setInterval(checkReminders, 60e3);

/* ---------- 每天早上的今日汇总（Windows 通知） ---------- */
const DIGEST_FILE = path.join(HERE, 'digest-sent.txt');
const p2 = n => String(n).padStart(2, '0');
const ymd = t => `${t.getFullYear()}-${p2(t.getMonth() + 1)}-${p2(t.getDate())}`;
const qHash = s => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) | 0; return 'q' + (h >>> 0).toString(36); }; // 和页面里的 hashStr 一致
function digestParts(d, now) {
  const td = ymd(now), tm = ymd(new Date(+now + 864e5)), dd = (a, b) => Math.round((new Date(a + 'T00:00') - new Date(b + 'T00:00')) / 864e5);
  const apps = d.apps || [], out = [], evs = [];
  for (const a of apps) for (const e of a.events || [])
    if (!e.done && e.at && e.at.slice(0, 10) === td && (e.type === 'interview' || e.type === 'test')) evs.push(`${e.at.slice(11, 16)} ${a.company}${e.title ? ' ' + e.title : ''}`);
  if (evs.length) out.push(evs.sort().join('，'));
  for (const a of apps) { const dl = a.status === 'offer' && a.offer && a.offer.deadline; if (!dl) continue; const n = dd(dl, td); if (n >= 0 && n <= 3) out.push(`${a.company} Offer ${n ? n + ' 天后' : '今天'}截止答复`); }
  const due = apps.filter(a => a.status === 'wish' && (a.due === td || a.due === tm)).length; if (due) out.push(`${due} 个岗位今明两天截止投递`);
  const ppl = (d.people || []).filter(p => p.nextAt && p.nextAt <= td).length; if (ppl) out.push(`${ppl} 位联系人该跟进`);
  const seen = new Set(); let nq = 0;
  for (const a of apps) for (const e of a.events || []) for (const line of String(e.questions || '').split(/\n+/)) {
    const raw = line.replace(/^\s*(\d+[.、)]|[-*•])\s*/, '').trim(); if (!raw) continue;
    const h = qHash(raw.replace(/https?:\/\/\S+/, '').trim() || raw); if (seen.has(h)) continue; seen.add(h);
    if ((d.qmark || {})[h] !== 'ok' && (!(d.qsrs || {})[h] || d.qsrs[h].due <= td)) nq++;
  }
  if (nq) out.push(`${nq} 道面试题该复习`);
  return out;
}
async function checkDigest() {
  let j; try { j = JSON.parse(await fsp.readFile(DATA_FILE, 'utf8')); } catch { return; }
  const d = j && j.data; if (!d || d.settings?.digest === false) return;
  const now = new Date(), hr = +(d.settings?.digestHour ?? 9);
  if (now.getHours() < hr || now.getHours() >= 20) return; // 晚上 8 点后才开机就不补发了
  const td = ymd(now);
  let last = ''; try { last = (await fsp.readFile(DIGEST_FILE, 'utf8')).trim(); } catch {}
  if (last === td) return;
  await fsp.writeFile(DIGEST_FILE, td);
  const parts = digestParts(d, now);
  if (parts.length) winToast('履迹 · 今天', parts.join(' · '), `${SELF}/jobs/`);
}
setInterval(checkDigest, 60e3); setTimeout(checkDigest, 20e3);

/* ---------- 历史备份：列出 / 读取 / 恢复前存档 ---------- */
async function listBackups(dir, kind) {
  let names = []; try { names = (await fsp.readdir(dir)).filter(f => f.endsWith('.json')); } catch { return []; }
  const out = [];
  for (const name of names) {
    const f = path.join(dir, name);
    try { const st = await fsp.stat(f); const j = JSON.parse(await fsp.readFile(f, 'utf8')); out.push({ kind, name, savedAt: j.savedAt || st.mtimeMs, size: st.size, apps: j.data?.apps?.length ?? 0, journal: j.data?.journal?.length ?? 0, questions: (j.data?.apps || []).reduce((t, a) => t + (a.events || []).filter(e => e.questions).length, 0) }); } catch {}
  }
  return out;
}

let TOKEN = '';
try { TOKEN = fs.readFileSync(TOKEN_FILE, 'utf8').trim(); } catch {}
if (!TOKEN) { TOKEN = crypto.randomBytes(24).toString('hex'); fs.writeFileSync(TOKEN_FILE, TOKEN); }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8',
};

function cors(req, res) {
  // 只有 file:// 打开的「求职进度」（Origin 为 null）会跨源访问；真正的保护靠下面的密钥
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin === 'null' ? 'null' : `http://127.0.0.1:${PORT}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-token');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Vary', 'Origin');
}
const tokenOk = (req) => {
  const t = String(req.headers['x-token'] || '');
  return t.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(TOKEN));
};
function send(res, code, obj) { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); }

async function readBody(req, limit = 20 * 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw new Error('too large'); chunks.push(c); }
  return Buffer.concat(chunks).toString('utf8');
}

async function saveData(payload) {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const text = JSON.stringify(payload, null, 1);
  const tmp = DATA_FILE + '.tmp';
  await fsp.writeFile(tmp, text, 'utf8');
  await fsp.rename(tmp, DATA_FILE);
  const d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await fsp.writeFile(path.join(BACKUP_DIR, `求职进度-${day}.json`), text, 'utf8');
  const files = (await fsp.readdir(BACKUP_DIR)).filter(f => f.endsWith('.json')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - KEEP_BACKUPS))) await fsp.unlink(path.join(BACKUP_DIR, f)).catch(() => {});
}

// 收件箱：浏览器「加到履迹」小窗口把岗位先放这里，履迹打开时自动收进去
async function readInbox() { try { return JSON.parse(await fsp.readFile(INBOX_FILE, 'utf8')); } catch { return []; } }
async function writeInbox(list) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const tmp = INBOX_FILE + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(list), 'utf8');
  await fsp.rename(tmp, INBOX_FILE);
}

async function api(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.url === '/api/health') return send(res, 200, { ok: true, app: 'local-helper' });
  if (req.url === '/api/inbox' && req.method === 'POST') {
    // 只接受本机页面（/jobs/add.html）提交；其他网站发来的请求 Origin 不同，直接拒绝
    if (req.headers.origin !== SELF && !tokenOk(req)) return send(res, 403, { error: 'origin' }); // 本机 add.html，或带密钥的浏览器扩展
    let it; try { it = JSON.parse(await readBody(req, 256 * 1024)); } catch { return send(res, 400, { error: 'bad payload' }); }
    const item = { id: crypto.randomBytes(8).toString('hex'), at: Date.now() };
    for (const k of ['company', 'role', 'city', 'salary', 'channel', 'link', 'jd', 'status', 'kind', 'hr', 'text', 'auto']) item[k] = String(it?.[k] ?? '').slice(0, k === 'jd' || k === 'text' ? 8000 : 500);
    const list = await readInbox();
    if (list.length >= 500) return send(res, 429, { error: 'inbox full' });
    list.push(item); await writeInbox(list);
    return send(res, 200, { ok: true });
  }
  if (!tokenOk(req)) return send(res, 401, { error: 'token' });
  if (req.url === '/api/ai/status' && req.method === 'GET') return send(res, 200, aiStatus());
  if (req.url === '/api/ext/hello' && req.method === 'POST') { try { extVer = String(JSON.parse(await readBody(req, 1024)).v || '').slice(0, 20); } catch {} extSeen = Date.now(); return send(res, 200, { ok: true }); }
  if (req.url === '/api/ext/status' && req.method === 'GET') return send(res, 200, { seen: extSeen, ver: extVer, dir: fs.existsSync(path.join(EXT_DIR, 'manifest.json')) ? EXT_DIR : '' });
  if (req.url === '/api/ext/open' && req.method === 'POST') {
    if (!fs.existsSync(path.join(EXT_DIR, 'manifest.json'))) return send(res, 404, { error: '没找到扩展文件夹' });
    spawn('explorer.exe', [EXT_DIR], { detached: true, stdio: 'ignore' }).unref();
    return send(res, 200, { ok: true, dir: EXT_DIR });
  }
  if (req.url === '/api/ai/key' && req.method === 'POST') {
    try { setDeepseekKey(JSON.parse(await readBody(req, 4096)).key); return send(res, 200, aiStatus()); } catch (e) { return send(res, 400, { error: e.message }); }
  }
  if (req.url.startsWith('/api/leetcode?') && req.method === 'GET') {
    const q = new URL(req.url, 'http://x').searchParams;
    try { return send(res, 200, await lcSync(q.get('u'), q.get('force') === '1')); } catch (e) { return send(res, 502, { error: e.message }); }
  }
  if (req.url === '/api/ai' && req.method === 'POST') {
    let b; try { b = JSON.parse(await readBody(req, 512 * 1024)); } catch { return send(res, 400, { error: '请求格式不对' }); }
    try { return send(res, 200, await runAI(b)); } catch (e) { return send(res, 502, { error: String(e.message || e) }); }
  }
  lastSeen = Date.now();
  if (req.url === '/api/ping') return send(res, 200, { ok: true });
  if (req.url === '/api/backups' && req.method === 'GET') {
    const L = [...await listBackups(BACKUP_DIR, 'daily'), ...await listBackups(SNAP_DIR, 'snap')].sort((a, b) => b.savedAt - a.savedAt);
    return send(res, 200, { items: L });
  }
  if (req.url.startsWith('/api/backups/file?') && req.method === 'GET') {
    const q = new URL(req.url, SELF).searchParams, name = q.get('name') || '', dir = q.get('kind') === 'snap' ? SNAP_DIR : BACKUP_DIR;
    if (!/^[^\\/:*?"<>|]+\.json$/.test(name) || name.includes('..')) return send(res, 400, { error: 'bad name' });
    try { const t = await fsp.readFile(path.join(dir, name), 'utf8'); res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); return res.end(t); }
    catch { return send(res, 404, { error: 'not found' }); }
  }
  if (req.url === '/api/backups/snapshot' && req.method === 'PUT') {
    try {
      const body = JSON.parse(await readBody(req));
      if (!body || !body.data || !Array.isArray(body.data.apps)) return send(res, 400, { error: 'bad payload' });
      await fsp.mkdir(SNAP_DIR, { recursive: true });
      const d = new Date(), z = n => String(n).padStart(2, '0');
      const name = `恢复前-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}.json`;
      await fsp.writeFile(path.join(SNAP_DIR, name), JSON.stringify({ savedAt: body.savedAt || Date.now(), data: body.data }), 'utf8');
      const files = (await fsp.readdir(SNAP_DIR)).filter(f => f.endsWith('.json')).sort();
      for (const f of files.slice(0, Math.max(0, files.length - 20))) await fsp.unlink(path.join(SNAP_DIR, f)).catch(() => {});
      return send(res, 200, { ok: true, name });
    } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
  }
  if (req.url === '/api/inbox' && req.method === 'GET') return send(res, 200, { items: await readInbox() });
  if (req.url === '/api/inbox' && req.method === 'DELETE') {
    let ids = []; try { ids = JSON.parse(await readBody(req, 64 * 1024)).ids || []; } catch {}
    const set = new Set(ids); await writeInbox((await readInbox()).filter(x => !set.has(x.id)));
    return send(res, 200, { ok: true });
  }
  if (req.url === '/api/jobtracker' && req.method === 'GET') {
    try { const t = await fsp.readFile(DATA_FILE, 'utf8'); res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); return res.end(t); }
    catch { return send(res, 200, { savedAt: 0, data: null, folder: DATA_DIR }); }
  }
  if (req.url === '/api/jobtracker' && req.method === 'PUT') {
    try {
      const body = JSON.parse(await readBody(req));
      if (!body || typeof body.savedAt !== 'number' || !body.data || !Array.isArray(body.data.apps)) return send(res, 400, { error: 'bad payload' });
      body.folder = DATA_DIR;
      await saveData(body);
      return send(res, 200, { ok: true, folder: DATA_DIR });
    } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
  }
  // Claude Code 用量（读本机对话记录 + 状态栏写下的官方额度）
  if (req.url === '/api/agent' && req.method === 'GET') {
    try { const [cc, others] = await Promise.all([agentUsage(AGENT_FILE), othersUsage()]); return send(res, 200, { ...cc, others }); } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
  }
  // 如页简历（存在浏览器 localStorage 里）也备份一份到文件
  if (req.url === '/api/ruye' && req.method === 'GET') {
    try { const t = await fsp.readFile(RUYE_FILE, 'utf8'); res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); return res.end(t); }
    catch { return send(res, 200, { savedAt: 0, docs: null }); }
  }
  if (req.url === '/api/ruye' && req.method === 'PUT') {
    try {
      const body = JSON.parse(await readBody(req));
      if (!body || typeof body.savedAt !== 'number' || typeof body.docs !== 'string') return send(res, 400, { error: 'bad payload' });
      JSON.parse(body.docs);
      const text = JSON.stringify({ savedAt: body.savedAt, docs: body.docs, current: String(body.current || '') });
      await fsp.mkdir(RUYE_BAK, { recursive: true });
      const tmp = RUYE_FILE + '.tmp'; await fsp.writeFile(tmp, text, 'utf8'); await fsp.rename(tmp, RUYE_FILE);
      const day = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      await fsp.writeFile(path.join(RUYE_BAK, `简历-${day}.json`), text, 'utf8');
      const files = (await fsp.readdir(RUYE_BAK)).filter(f => f.endsWith('.json')).sort();
      for (const f of files.slice(0, Math.max(0, files.length - KEEP_BACKUPS))) await fsp.unlink(path.join(RUYE_BAK, f)).catch(() => {});
      return send(res, 200, { ok: true });
    } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
  }
  if (req.url === '/api/migrated' && req.method === 'PUT') {
    await fsp.writeFile(path.join(HERE, 'migrated.txt'), new Date().toISOString());
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'not found' });
}

async function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/jobs') { res.writeHead(301, { location: '/jobs/' }); return res.end(); }
  let root = RUYE;
  if (p.startsWith('/jobs/')) { root = JOBS; p = p.slice(5); }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(root, '.' + p);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) throw 0;
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream', 'content-length': st.size,
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=604800',
      'x-content-type-options': 'nosniff',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('not found');
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return api(req, res).catch(e => send(res, 500, { error: String(e) }));
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res);
});
server.on('error', (e) => { if (e.code === 'EADDRINUSE') process.exit(0); throw e; });
server.listen(PORT, '127.0.0.1');
setTimeout(() => agentUsage(AGENT_FILE).catch(() => {}), 3000); // 预先扫描一遍，打开页面时更快

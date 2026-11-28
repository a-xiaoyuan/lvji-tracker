// 手机查看（可选，默认关闭）
// 在履迹「设置」里打开后，在局域网里另开一个端口（默认 47322），只提供一个只读小页面和一份精简数据：
//  - 今天起 30 天内的笔试 / 面试日程，最近 300 条投递的公司、岗位、进度、城市、投递日期
//  - 不含备注、联系人、薪资、JD、日记等其他内容；不能改任何数据
// 访问要带一串随机访问码（放在链接 # 后面，不会出现在请求地址里）；连续输错 20 次会锁 10 分钟。
// 主服务（47321，带完整数据和 AI）仍然只监听 127.0.0.1，不受影响。
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const ABC = 'abcdefghjkmnpqrstuvwxyz23456789';
const LAN = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export function phoneSlim(doc, now = new Date()) {
  const d = (doc && doc.data) || {}, apps = Array.isArray(d.apps) ? d.apps : [];
  const pad = n => String(n).padStart(2, '0'), ds = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const td = ds(now), lim = ds(new Date(now.getTime() + 30 * 864e5)), s = v => String(v ?? '').slice(0, 200);
  const ok = apps.filter(a => a && typeof a === 'object');
  const events = [];
  for (const a of ok) for (const e of Array.isArray(a.events) ? a.events : []) {
    if (!e || e.done || !e.at || (e.type !== 'interview' && e.type !== 'test')) continue;
    const day = String(e.at).slice(0, 10);
    if (day >= td && day <= lim) events.push({ at: s(e.at), type: s(e.type), title: s(e.title), place: s(e.place), c: s(a.company), r: s(a.role) });
  }
  events.sort((x, y) => (x.at < y.at ? -1 : 1));
  const L = ok.slice().sort((x, y) => (+y.updatedAt || 0) - (+x.updatedAt || 0)), counts = {};
  for (const a of L) counts[a.status] = (counts[a.status] || 0) + 1;
  return {
    savedAt: +(doc && doc.savedAt) || 0, today: td, total: L.length, counts, events: events.slice(0, 60),
    apps: L.slice(0, 300).map(a => ({ c: s(a.company), r: s(a.role), s: s(a.status), city: s(a.city), ap: s(a.appliedAt) })),
  };
}

export function createPhone({ stateDir, dataFile, pageFile, port }) {
  const F = path.join(stateDir, 'phone.json');
  let st = { on: false, code: '' };
  try { st = { ...st, ...JSON.parse(fs.readFileSync(F, 'utf8')) }; } catch {}
  let srv = null, fails = [];
  const save = () => fsp.writeFile(F, JSON.stringify(st)).catch(() => {});
  const newCode = () => Array.from(crypto.randomBytes(12), b => ABC[b % ABC.length]).join('');

  function handle(req, res) {
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'no-referrer');
    const p = new URL(req.url, 'http://x').pathname;
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    if (p === '/') {
      return fs.readFile(pageFile, (e, b) => {
        if (e) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src data:" });
        res.end(b);
      });
    }
    if (p === '/data') {
      const now = Date.now(); fails = fails.filter(t => now - t < 600000);
      if (fails.length >= 20) { res.writeHead(429, { 'content-type': 'application/json' }); return res.end('{"error":"locked"}'); }
      const c = String(req.headers['x-code'] || '');
      if (!st.code || c.length !== st.code.length || !crypto.timingSafeEqual(Buffer.from(c), Buffer.from(st.code))) {
        fails.push(now); res.writeHead(401, { 'content-type': 'application/json' }); return res.end('{"error":"code"}');
      }
      return fsp.readFile(dataFile, 'utf8').then(t => JSON.parse(t)).catch(() => null).then(d => {
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(phoneSlim(d)));
      });
    }
    res.writeHead(404); res.end();
  }
  const start = () => srv ? Promise.resolve() : new Promise((ok, bad) => {
    const s = http.createServer(handle);
    s.once('error', bad);
    s.listen(port, '0.0.0.0', () => { srv = s; ok(); });
  });
  const stop = () => { if (srv) { srv.close(); srv.closeAllConnections?.(); srv = null; } };
  const urls = () => {
    const out = [];
    for (const L of Object.values(os.networkInterfaces())) for (const x of L || []) if (x.family === 'IPv4' && !x.internal && LAN.test(x.address)) out.push(`http://${x.address}:${port}/#${st.code}`);
    return out;
  };
  const info = err => ({ on: !!srv, urls: srv ? urls() : [], port, ...(err ? { error: err } : {}) });
  async function set(on, reset) {
    if (on) {
      if (!st.code || reset) { st.code = newCode(); fails = []; }
      try { await start(); } catch (e) { st.on = false; await save(); return info(e.code === 'EADDRINUSE' ? `端口 ${port} 被别的程序占用了` : String(e.message || e)); }
      st.on = true;
    } else { stop(); st.on = false; }
    await save(); return info();
  }
  if (st.on && st.code) start().catch(() => {});
  return { info, set };
}

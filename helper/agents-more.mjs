// 其他 Agent 的用量（都只在本机读取，不读任何登录凭据文件）
//  - Codex：~/.codex/sessions、archived_sessions 里的会话记录（token_count 事件带官方额度 rate_limits）
//  - dsh：~/.dsh/.dshw-usage.json（余额、每天花费、按模型的消耗）
//  - WorkBuddy：~/.workbuddy/workbuddy.db 的 session_usage 表（每个会话用了多少积分）
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

const HOME = os.homedir();
const KEEP_MS = 35 * 864e5;
const dkey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function last30() { const out = []; const now = Date.now(); for (let i = 29; i >= 0; i--) { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); out.push(dkey(+d)); } return out; }
async function exists(p) { try { await fsp.access(p); return true; } catch { return false; } }

/* ---------- Codex ---------- */
const cxCache = new Map(); // file -> { size, recs, rl, lastTotal }
async function listJsonl(dir, out = []) {
  let ents = []; try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) { const p = path.join(dir, e.name); if (e.isDirectory()) await listJsonl(p, out); else if (e.name.endsWith('.jsonl')) out.push(p); }
  return out;
}
async function parseCodex(file, st) {
  let c = cxCache.get(file);
  if (!c || st.size < c.size) { c = { size: 0, recs: [], rl: null, lastTotal: -1, model: '' }; cxCache.set(file, c); }
  if (st.size === c.size || st.mtimeMs < Date.now() - KEEP_MS) { c.size = st.size; return c; }
  const rl = readline.createInterface({ input: fs.createReadStream(file, { start: c.size, end: st.size - 1, encoding: 'utf8' }), crlfDelay: Infinity });
  let consumed = c.size;
  for await (const line of rl) {
    consumed += Buffer.byteLength(line, 'utf8') + 1;
    if (line.includes('"turn_context"')) { try { const d = JSON.parse(line); if (d.payload?.model) c.model = d.payload.model; } catch {} continue; }
    if (!line.includes('"token_count"')) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    const p = d.payload || {}, t = Date.parse(d.timestamp);
    if (p.type !== 'token_count' || !t) continue;
    if (p.rate_limits && (p.rate_limits.primary || p.rate_limits.secondary) && (!c.rl || t >= c.rl.at)) c.rl = { at: t, ...p.rate_limits };
    const tot = p.info?.total_token_usage?.total_tokens, last = p.info?.last_token_usage;
    if (!last || tot === c.lastTotal) continue; // 同一轮会重复上报，按累计值去重
    c.lastTotal = tot;
    c.recs.push({ t, i: (last.input_tokens || 0) - (last.cached_input_tokens || 0), cr: last.cached_input_tokens || 0, o: last.output_tokens || 0, m: c.model });
  }
  c.size = Math.min(consumed, st.size);
  return c;
}
export async function codexUsage() {
  const root = path.join(HOME, '.codex');
  if (!(await exists(root))) return null;
  const files = [...await listJsonl(path.join(root, 'sessions')), ...await listJsonl(path.join(root, 'archived_sessions'))];
  const recs = []; let rl = null;
  for (const f of files) {
    let st; try { st = await fsp.stat(f); } catch { continue; }
    const c = await parseCodex(f, st);
    recs.push(...c.recs);
    if (c.rl && (!rl || c.rl.at > rl.at)) rl = c.rl;
  }
  const now = Date.now(), keys = last30(), idx = new Map(keys.map((k, i) => [k, i]));
  const days = keys.map(d => ({ d, o: 0, i: 0, cr: 0, n: 0 }));
  const sum = { today: { o: 0, i: 0, cr: 0, n: 0 }, week: { o: 0, i: 0, cr: 0, n: 0 } }, M = {};
  for (const r of recs) {
    const k = idx.get(dkey(r.t)); if (k !== undefined) { const x = days[k]; x.o += r.o; x.i += r.i; x.cr += r.cr; x.n++; }
    if (r.t >= now - 7 * 864e5) { const w = sum.week; w.o += r.o; w.i += r.i; w.cr += r.cr; w.n++; const mm = r.m || '未知'; M[mm] = (M[mm] || 0) + r.o; }
    if (dkey(r.t) === dkey(now)) { const w = sum.today; w.o += r.o; w.i += r.i; w.cr += r.cr; w.n++; }
  }
  return { rl, days, ...sum, models: Object.entries(M).sort((a, b) => b[1] - a[1]) };
}

/* ---------- dsh ---------- */
export async function dshUsage() {
  const f = path.join(HOME, '.dsh', '.dshw-usage.json');
  let d, st; try { [d, st] = [JSON.parse(await fsp.readFile(f, 'utf8')), await fsp.stat(f)]; } catch { return null; }
  // 账本里的金额单位是 1e-8 元
  let balance = typeof d.lastBalance === 'number' ? d.lastBalance : null, currency = 'CNY';
  const books = d.accounting?.books || {}, act = books[d.accounting?.active];
  if (act?.days) { const ks = Object.keys(act.days).sort(); const lastDay = act.days[ks[ks.length - 1]]; if (lastDay && typeof lastDay.lastUnits === 'number') balance = lastDay.lastUnits / 1e8; currency = act.currency || currency; }
  const keys = last30(), H = d.history || {};
  const days = keys.map(k => ({ d: k, cost: +H[k] || 0, tokens: 0, n: 0 }));
  const idx = new Map(keys.map((k, i) => [k, i])), M = {};
  const now = Date.now();
  for (const e of d.events || []) {
    const k = idx.get(e.day || dkey(e.ts)); if (k !== undefined) { days[k].tokens += e.tokens || 0; days[k].n++; }
    if (e.ts >= now - 7 * 864e5) { const m = M[e.model || '未知'] = M[e.model || '未知'] || { cost: 0, tokens: 0, n: 0 }; m.cost += e.cost || 0; m.tokens += e.tokens || 0; m.n++; }
  }
  const week = days.slice(-7).reduce((t, x) => t + x.cost, 0), month = days.reduce((t, x) => t + x.cost, 0);
  const today = days[days.length - 1].cost;
  const active7 = days.slice(-7).filter(x => x.cost > 0).length;
  return { balance, currency, today, week, month, days, updatedAt: st.mtimeMs, models: Object.entries(M).sort((a, b) => b[1].cost - a[1].cost), avgDaily: active7 ? week / 7 : 0 };
}

/* ---------- WorkBuddy ---------- */
export async function workbuddyUsage() {
  const f = path.join(HOME, '.workbuddy', 'workbuddy.db');
  if (!(await exists(f))) return null;
  let sqlite; try { sqlite = await import('node:sqlite'); } catch { return { error: '当前 Node 版本不支持读取 WorkBuddy 数据库' }; }
  let db;
  try {
    db = new sqlite.DatabaseSync(f, { readOnly: true });
    const rows = db.prepare('select su.session_id id, su.used, su.size, su.updated_at at, su.credit_json cj, s.model, coalesce(s.custom_title, s.title) title, s.created_at created from session_usage su left join sessions s on s.id = su.session_id').all();
    const keys = last30(), idx = new Map(keys.map((k, i) => [k, i]));
    const days = keys.map(d => ({ d, credits: 0, n: 0 })), M = {}, now = Date.now();
    const list = [];
    for (const r of rows) {
      let c = 0; try { for (const v of Object.values(JSON.parse(r.cj || '{}'))) c += +v || 0; } catch {}
      const t = r.at || r.created || 0, k = idx.get(dkey(t));
      if (k !== undefined) { days[k].credits += c; days[k].n++; }
      if (t >= now - 7 * 864e5) M[r.model || '未知'] = (M[r.model || '未知'] || 0) + c;
      list.push({ title: r.title || '未命名会话', model: r.model || '', credits: Math.round(c * 100) / 100, at: t, ctx: r.size ? Math.round(r.used / r.size * 100) : null });
    }
    list.sort((a, b) => b.at - a.at);
    const sumDays = n => days.slice(-n).reduce((t, x) => t + x.credits, 0);
    return { today: days[days.length - 1].credits, week: sumDays(7), month: sumDays(30), days, models: Object.entries(M).sort((a, b) => b[1] - a[1]), recent: list.slice(0, 8), sessions: rows.length };
  } catch (e) { return { error: String(e.message || e) }; }
  finally { try { db?.close(); } catch {} }
}

/* ---------- Grok Bot：客户端缓存的每周额度 ---------- */
export async function grokUsage() {
  const dir = path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'Grok Bot', 'sand-client-persistence');
  let files; try { files = await fsp.readdir(dir); } catch { return null; }
  const b32 = s => { const A = 'abcdefghijklmnopqrstuvwxyz234567'; let bits = ''; const out = []; for (const ch of s) { const v = A.indexOf(ch); if (v < 0) return ''; bits += v.toString(2).padStart(5, '0'); } for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out).toString('utf8'); };
  let best = null;
  for (const f of files) {
    if (!f.endsWith('.blob') || !b32(f.slice(0, -5)).endsWith('.weekly-usage.cache')) continue;
    try {
      const d = JSON.parse(await fsp.readFile(path.join(dir, f), 'utf8'));
      const r = d.value?.reading, u = r?.usage; if (!u) continue;
      if (!best || r.readAtMs > best.at) best = { at: r.readAtMs, pct: u.percentUsed, resetAt: u.nextResetMs, plan: u.unifiedPlanName || u.grokPlanLabel || '', blocked: !!u.wouldRefuseSend, prepaid: (u.prepaidBalanceCents || 0) / 100 };
    } catch {}
  }
  return best || { none: true };
}

/* ---------- Kimi Code：每一步的 token 用量 ---------- */
const kmCache = new Map();
export async function kimiUsage() {
  const dir = path.join(HOME, '.kimi-code', 'server', 'events');
  let files; try { files = (await fsp.readdir(dir)).filter(f => f.startsWith('session_') && f.endsWith('.jsonl')); } catch { return null; }
  const recs = [];
  for (const name of files) {
    const f = path.join(dir, name); let st; try { st = await fsp.stat(f); } catch { continue; }
    let c = kmCache.get(f);
    if (!c || c.size !== st.size) {
      c = { size: st.size, recs: [] };
      const rl = readline.createInterface({ input: fs.createReadStream(f, { encoding: 'utf8' }), crlfDelay: Infinity });
      for await (const line of rl) {
        if (!line.includes('turn.step.completed')) continue;
        try { const p = JSON.parse(line).envelope?.payload; const u = p?.usage; if (p?.type === 'turn.step.completed' && u && p.time) c.recs.push({ t: p.time, o: u.output || 0, i: (u.inputOther || 0) + (u.inputCacheCreation || 0), cr: u.inputCacheRead || 0 }); } catch {}
      }
      kmCache.set(f, c);
    }
    recs.push(...c.recs);
  }
  return tokenSummary(recs, files.length);
}
function tokenSummary(recs, sessions) {
  const now = Date.now(), keys = last30(), idx = new Map(keys.map((k, i) => [k, i]));
  const days = keys.map(d => ({ d, o: 0, i: 0, cr: 0, n: 0 })), week = { o: 0, i: 0, cr: 0, n: 0 }, today = { o: 0, i: 0, cr: 0, n: 0 }, all = { o: 0, n: 0 };
  let last = 0;
  for (const r of recs) {
    last = Math.max(last, r.t); all.o += r.o; all.n++;
    const k = idx.get(dkey(r.t)); if (k !== undefined) { const x = days[k]; x.o += r.o; x.i += r.i; x.cr += r.cr; x.n++; }
    if (r.t >= now - 7 * 864e5) { week.o += r.o; week.i += r.i; week.cr += r.cr; week.n++; }
    if (dkey(r.t) === dkey(now)) { today.o += r.o; today.i += r.i; today.cr += r.cr; today.n++; }
  }
  return { kind: 'tokens', days, week, today, all, last, sessions };
}

/* ---------- Qoder（国际版 + 国内版）：只有对话记录，没有积分 ---------- */
const qdCache = new Map();
export async function qoderUsage() {
  const out = {};
  for (const [k, dirName] of [['intl', '.qoder'], ['cn', '.qoder-cn']]) {
    const root = path.join(HOME, dirName, 'projects');
    let projs; try { projs = await fsp.readdir(root, { withFileTypes: true }); } catch { continue; }
    const recs = [], sessions = [];
    for (const p of projs) {
      if (!p.isDirectory()) continue;
      let fl; try { fl = (await fsp.readdir(path.join(root, p.name))).filter(f => f.endsWith('.jsonl')); } catch { continue; }
      for (const name of fl) {
        const f = path.join(root, p.name, name); let st; try { st = await fsp.stat(f); } catch { continue; }
        let c = qdCache.get(f);
        if (!c || c.size !== st.size) {
          c = { size: st.size, ts: [], cwd: '' };
          const rl = readline.createInterface({ input: fs.createReadStream(f, { encoding: 'utf8' }), crlfDelay: Infinity });
          for await (const line of rl) {
            if (!line.startsWith('{"type":"assistant"') && !line.startsWith('{"type":"user"')) continue;
            try { const d = JSON.parse(line); const t = Date.parse(d.timestamp); if (!t) continue; if (d.cwd) c.cwd = d.cwd; if (d.type === 'assistant') c.ts.push(t); } catch {}
          }
          qdCache.set(f, c);
        }
        for (const t of c.ts) recs.push({ t, o: 0, i: 0, cr: 0 });
        if (c.ts.length) sessions.push({ project: path.basename(c.cwd || p.name), n: c.ts.length, last: Math.max(...c.ts) });
      }
    }
    const s = tokenSummary(recs, sessions.length);
    s.kind = 'activity'; s.recent = sessions.sort((a, b) => b.last - a.last).slice(0, 6);
    out[k] = s;
  }
  return Object.keys(out).length ? out : null;
}

/* ---------- Antigravity（Gemini）：对话和步数 ---------- */
export async function antigravityUsage() {
  const f = path.join(HOME, '.gemini', 'antigravity', 'conversation_summaries.db');
  if (!(await exists(f))) return null;
  let sqlite; try { sqlite = await import('node:sqlite'); } catch { return { error: '当前 Node 版本不支持读取数据库' }; }
  let db;
  try {
    db = new sqlite.DatabaseSync(f, { readOnly: true });
    const rows = db.prepare('select title, step_count n, last_modified_time t from conversation_summaries').all()
      .map(r => ({ title: r.title || '未命名对话', n: r.n || 0, t: Date.parse(String(r.t).replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1')) || 0 }));
    rows.sort((a, b) => b.t - a.t);
    const keys = last30(), idx = new Map(keys.map((k, i) => [k, i])), days = keys.map(d => ({ d, o: 0, n: 0 }));
    for (const r of rows) { const k = idx.get(dkey(r.t)); if (k !== undefined) { days[k].n += r.n; days[k].o += r.n; } }
    const now = Date.now(), wk = rows.filter(r => r.t >= now - 7 * 864e5);
    return { kind: 'activity', conversations: rows.length, steps: rows.reduce((t, r) => t + r.n, 0), week: { n: wk.reduce((t, r) => t + r.n, 0), c: wk.length }, last: rows[0]?.t || 0, recent: rows.slice(0, 6), days };
  } catch (e) { return { error: String(e.message || e) }; }
  finally { try { db?.close(); } catch {} }
}

/* ---------- Trae：本机数据是加密的，只检测是否安装 ---------- */
export async function traeUsage() {
  const base = process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming');
  const found = [];
  for (const n of ['Trae CN', 'TRAE SOLO CN', 'Trae']) if (await exists(path.join(base, n))) found.push(n);
  return found.length ? { unavailable: true, apps: found } : null;
}

export async function othersUsage() {
  const safe = p => p.catch(e => ({ error: String(e.message || e) }));
  const [codex, dsh, workbuddy, grok, kimi, qoder, gemini, trae] = await Promise.all([codexUsage(), dshUsage(), workbuddyUsage(), grokUsage(), kimiUsage(), qoderUsage(), antigravityUsage(), traeUsage()].map(safe));
  return { codex, dsh, workbuddy, grok, kimi, qoder, gemini, trae };
}

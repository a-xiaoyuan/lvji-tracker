// 统计 Claude Code 的用量：读取 ~/.claude/projects 下的对话记录（只在本机读，不上传）
//  - 每条助手回复都带 usage（输入 / 输出 / 缓存读写 token），按时间汇总
//  - 5 小时窗口按 Claude Code 的规则估算：从第一条消息所在整点开始，持续 5 小时
//  - 官方百分比来自状态栏脚本写的 agent-usage.json（statusline.mjs）
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

const ROOT = path.join(os.homedir(), '.claude', 'projects');
const KEEP_MS = 35 * 864e5;
const H5 = 5 * 3600e3;
const cache = new Map(); // file -> { size, recs: [], seen: Set }

async function listJsonl(dir, out = []) {
  let ents = [];
  try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'tool-results') await listJsonl(p, out); }
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

function projName(cwd) {
  if (!cwd) return '未知';
  if (/scratch-workspaces/i.test(cwd)) return '临时会话';
  return path.basename(cwd) || cwd;
}

function family(m) {
  m = String(m || '').toLowerCase();
  if (m.includes('opus')) return 'Opus';
  if (m.includes('sonnet')) return 'Sonnet';
  if (m.includes('haiku')) return 'Haiku';
  if (m.includes('fable')) return 'Fable';
  return '其他';
}

async function parseFile(file, st) {
  let c = cache.get(file);
  if (!c || st.size < c.size) { c = { size: 0, recs: [], seen: new Set() }; cache.set(file, c); }
  if (st.size === c.size) return c;
  const cutoff = Date.now() - KEEP_MS;
  if (st.mtimeMs < cutoff) { c.size = st.size; return c; }
  const stream = fs.createReadStream(file, { start: c.size, end: st.size - 1, encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let consumed = c.size;
  for await (const line of rl) {
    consumed += Buffer.byteLength(line, 'utf8') + 1;
    if (!line.includes('"usage"')) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    const m = d.message, u = m && m.usage;
    if (d.type !== 'assistant' || !u || !d.timestamp) continue;
    const t = Date.parse(d.timestamp); if (!(t >= cutoff)) continue;
    const key = (m.id || '') + '|' + (d.requestId || '');
    if (c.seen.has(key)) continue; c.seen.add(key);
    if (m.model === '<synthetic>') continue;
    c.recs.push({ t, f: family(m.model), p: projName(d.cwd), i: u.input_tokens || 0, o: u.output_tokens || 0, cw: u.cache_creation_input_tokens || 0, cr: u.cache_read_input_tokens || 0 });
  }
  // 最后一行可能还没写完：按实际读到的字节数推进，下次从这里接着读
  c.size = Math.min(consumed, st.size);
  if (c.recs.length && c.recs[0].t < cutoff) c.recs = c.recs.filter(r => r.t >= cutoff);
  return c;
}

let busy = null;
async function collect() {
  const files = await listJsonl(ROOT);
  const all = [];
  for (const f of files) {
    let st; try { st = await fsp.stat(f); } catch { continue; }
    const c = await parseFile(f, st);
    for (const r of c.recs) all.push(r);
  }
  for (const k of [...cache.keys()]) if (!files.includes(k)) cache.delete(k);
  all.sort((a, b) => a.t - b.t);
  return all;
}

const sum = (L) => L.reduce((s, r) => { s.i += r.i; s.o += r.o; s.cw += r.cw; s.cr += r.cr; s.n++; return s; }, { i: 0, o: 0, cw: 0, cr: 0, n: 0 });
const dkey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function blocks(recs) {
  const B = [];
  let cur = null;
  for (const r of recs) {
    if (!cur || r.t >= cur.end) {
      const s = new Date(r.t); s.setMinutes(0, 0, 0);
      cur = { start: +s, end: +s + H5, recs: [] }; B.push(cur);
    }
    cur.recs.push(r);
  }
  return B;
}

export async function agentUsage(officialFile) {
  if (!busy) busy = collect().finally(() => { setTimeout(() => { busy = null; }, 0); });
  const recs = await busy;
  const now = Date.now();
  let official = null;
  try { official = JSON.parse(await fsp.readFile(officialFile, 'utf8')); } catch {}

  const B = blocks(recs);
  const last = B[B.length - 1];
  const active = last && now < last.end ? last : null;
  const blockOut = b => { const s = sum(b.recs); const byF = {}; for (const r of b.recs) byF[r.f] = (byF[r.f] || 0) + r.o; return { start: b.start, end: b.end, lastAt: b.recs[b.recs.length - 1].t, ...s, byF }; };

  const days = [];
  for (let i = 29; i >= 0; i--) { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push({ d: dkey(+d), i: 0, o: 0, cw: 0, cr: 0, n: 0, byF: {} }); }
  const di = new Map(days.map((x, k) => [x.d, k]));
  for (const r of recs) { const k = di.get(dkey(r.t)); if (k === undefined) continue; const x = days[k]; x.i += r.i; x.o += r.o; x.cw += r.cw; x.cr += r.cr; x.n++; x.byF[r.f] = (x.byF[r.f] || 0) + r.o; }

  const wk = recs.filter(r => r.t >= now - 7 * 864e5);
  const P = {};
  for (const r of wk) { const p = P[r.p] = P[r.p] || { name: r.p, i: 0, o: 0, cw: 0, cr: 0, n: 0, last: 0 }; p.i += r.i; p.o += r.o; p.cw += r.cw; p.cr += r.cr; p.n++; p.last = Math.max(p.last, r.t); }
  const F = {};
  for (const r of wk) F[r.f] = (F[r.f] || 0) + r.o;
  // 一周 24 小时 × 7 天的活跃分布
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const r of wk) { const d = new Date(r.t); heat[(d.getDay() + 6) % 7][d.getHours()] += r.o; }

  return {
    now, official,
    block: active ? blockOut(active) : null,
    blocks: B.slice(-12).reverse().map(blockOut),
    week: sum(wk), weekByF: F, today: sum(recs.filter(r => dkey(r.t) === dkey(now))),
    days, heat,
    projects: Object.values(P).sort((a, b) => b.o - a.o).slice(0, 10),
    files: cache.size,
  };
}

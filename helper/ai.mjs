// 履迹的 AI 功能。三个通道，按设置的顺序尝试，前一个不可用（没余额、没登录）就自动换下一个：
//   deepseek：DeepSeek API，最快最便宜（密钥在环境变量 DEEPSEEK_API_KEY）
//   claude  ：本机 Claude Code 命令行，能联网搜索
//   codex   ：本机 Codex 命令行（ChatGPT 账号），能联网搜索，比较慢
// 页面只把这次任务需要的内容发过来；密钥只在本机进程里使用，不会回传给页面。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DS_URL = 'https://api.deepseek.com/chat/completions';
const NPM = path.join(process.env.APPDATA || '', 'npm');
const CLI = { claude: path.join(NPM, 'claude.cmd'), codex: path.join(NPM, 'codex.cmd') };
const CODEX_MODEL = process.env.LVJI_CODEX_MODEL || 'gpt-6-luna';
const WORK = path.join(os.tmpdir(), 'lvji-ai'); // 命令行工具在空目录里跑，不读任何项目文件
const busy = { claude: 0, codex: 0 };
const KEY_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'deepseek-key.txt');
// 密钥：优先用环境变量 DEEPSEEK_API_KEY，其次是设置页里填的（存在本机 helper 文件夹，不会回传给页面）
const dsKey = () => process.env.DEEPSEEK_API_KEY || (() => { try { return fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch { return ''; } })();
export function setDeepseekKey(k) {
  k = String(k || '').trim();
  if (!k) { try { fs.unlinkSync(KEY_FILE); } catch {} return; }
  if (!/^sk-[A-Za-z0-9_-]{16,}$/.test(k)) throw new Error('密钥格式不对，应该是 sk- 开头的一串字符');
  fs.writeFileSync(KEY_FILE, k, 'utf8'); delete bad.deepseek;
}
const bad = {}; // 最近确认不可用的通道：{ engine: { until, why } }，避免每次都先撞一次墙

export function aiStatus() {
  const why = k => (bad[k] ? '上次：' + bad[k].why : ''); // 成功一次就会清掉
  return {
    deepseek: { ok: !!dsKey(), why: dsKey() ? why('deepseek') : '还没填密钥', src: process.env.DEEPSEEK_API_KEY ? 'env' : dsKey() ? 'file' : '' },
    claude: { ok: fs.existsSync(CLI.claude), why: fs.existsSync(CLI.claude) ? why('claude') : '本机没有安装' },
    codex: { ok: fs.existsSync(CLI.codex), why: fs.existsSync(CLI.codex) ? why('codex') : '本机没有安装' },
  };
}

class Unavailable extends Error {} // 账户层面的问题：换下一个通道

const clip = (s, n) => String(s ?? '').slice(0, n);

async function deepseek({ system, messages, json, max, temperature }) {
  const key = dsKey();
  if (!key) throw new Unavailable('还没填密钥');
  const body = { model: 'deepseek-chat', messages: [{ role: 'system', content: system }, ...messages], temperature: temperature ?? 0.5, max_tokens: max };
  if (json) body.response_format = { type: 'json_object' };
  let r;
  try {
    r = await fetch(DS_URL, { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120e3) });
  } catch (e) { throw new Error(e.name === 'TimeoutError' ? 'DeepSeek 响应超时' : '连不上 DeepSeek，检查一下网络'); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) throw new Unavailable('密钥无效');
  if (r.status === 402) throw new Unavailable('账户余额不足');
  if (!r.ok) throw new Error('DeepSeek 出错：' + (j?.error?.message || `HTTP ${r.status}`));
  return j.choices?.[0]?.message?.content || '';
}

function flatPrompt({ system, messages, json }) {
  const convo = messages.map(m => (m.role === 'user' ? '【用户】\n' : '【你之前的回复】\n') + m.content).join('\n\n');
  return `${system}\n\n${convo}\n\n${json ? '只输出一个 JSON 对象，不要有任何其他文字，也不要用代码块包起来。' : '直接给出回答，用 Markdown。'}`;
}

// 参数都是程序里的固定值；提示词只走标准输入，不经过命令行
function runCli(engine, args, input, outFile) {
  if (!fs.existsSync(CLI[engine])) return Promise.reject(new Unavailable('本机没有安装'));
  if (busy[engine] >= 2) return Promise.reject(new Error('正在处理别的请求，稍等再试'));
  return new Promise((resolve, reject) => {
    busy[engine]++;
    const cmd = `"${CLI[engine]}" ${args.join(' ')}`;
    const ch = spawn(cmd, { cwd: WORK, shell: true, windowsHide: true, env: process.env });
    let out = '', err = '', done = false;
    const fin = (f, v) => { if (done) return; done = true; clearTimeout(t); busy[engine]--; f(v); };
    const t = setTimeout(() => { ch.kill(); fin(reject, new Error('超时（3 分钟）')); }, 180e3);
    ch.stdout.on('data', d => { out += d; });
    ch.stderr.on('data', d => { err += d; });
    ch.on('error', e => fin(reject, new Error('启动失败：' + e.message)));
    ch.on('close', async code => {
      let text = out.trim();
      if (outFile) { text = (await fsp.readFile(outFile, 'utf8').catch(() => '')).trim(); fsp.unlink(outFile).catch(() => {}); }
      const all = (err + '\n' + out);
      if (/not logged in|please run \/login|login required/i.test(all)) return fin(reject, new Unavailable('还没登录'));
      if (/not supported when using codex|usage limit|rate limit|quota/i.test(all) && !text) return fin(reject, new Unavailable('额度或模型不可用'));
      if (code === 0 && text) return fin(resolve, text);
      fin(reject, new Error((all.trim().split('\n').filter(Boolean).pop() || `退出码 ${code}`).slice(0, 200)));
    });
    ch.stdin.end(input, 'utf8');
  });
}

async function claude(o) {
  await fsp.mkdir(WORK, { recursive: true });
  return runCli('claude', ['-p', '--output-format', 'text', ...(o.web ? ['--allowedTools', 'WebSearch,WebFetch'] : [])], flatPrompt(o));
}

async function codex(o) {
  await fsp.mkdir(WORK, { recursive: true });
  const outFile = path.join(WORK, `out-${crypto.randomBytes(6).toString('hex')}.txt`);
  const args = ['exec', '--skip-git-repo-check', '--ephemeral', '-s', 'read-only', '-m', CODEX_MODEL, '-c', 'model_reasoning_effort=low', ...(o.web ? ['-c', 'tools.web_search=true'] : []), '-o', `"${outFile}"`, '-'];
  return runCli('codex', args, flatPrompt(o), outFile);
}

const RUN = { deepseek, claude, codex };
const NAME = { deepseek: 'DeepSeek', claude: 'Claude Code', codex: 'Codex' };

// body: { system, prompt | messages[{role,content}], json, web, engine, max, temperature }
export async function runAI(b) {
  const system = clip(b.system, 20000) || '你是一个帮助求职者的中文助手。';
  const messages = (Array.isArray(b.messages) && b.messages.length ? b.messages : [{ role: 'user', content: b.prompt }])
    .slice(-40).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: clip(m.content, 30000) }));
  const opt = { system, messages, json: !!b.json, web: !!b.web, max: Math.min(+b.max || 2000, 8000), temperature: b.temperature };
  const first = RUN[b.engine] ? b.engine : 'deepseek';
  let order = [first, ...['deepseek', 'claude', 'codex'].filter(k => k !== first)];
  if (opt.web) order = order.filter(k => k !== 'deepseek'); // 只有命令行工具能联网搜索
  const now = Date.now(), skipped = [];
  // 最近确认不可用的通道往后放，但不完全排除（可能已经充值或登录了）
  order.sort((x, y) => ((bad[x]?.until > now) - (bad[y]?.until > now)));
  for (const k of order) {
    try {
      const text = await RUN[k](opt);
      delete bad[k];
      return { engine: k, text, skipped };
    } catch (e) {
      if (!(e instanceof Unavailable)) throw new Error(`${NAME[k]}：${e.message}`);
      bad[k] = { until: Date.now() + 10 * 60e3, why: e.message };
      skipped.push(`${NAME[k]} ${e.message}`);
    }
  }
  throw new Error('没有可用的 AI：' + skipped.join('；'));
}

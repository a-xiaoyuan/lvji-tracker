// 邮箱收信（可选功能，默认关闭）
// 在履迹「设置」里填上 QQ 邮箱地址和「授权码」并打开后，每 10 分钟用 IMAP 看一眼收件箱：
//  - 只看新邮件（第一次打开时只看最近 7 天），只读，不删、不标已读、不发信
//  - 标题或正文像招聘通知（面试、笔试、测评、录用、感谢投递、很遗憾……）的，把标题、发件人和正文前 8000 字放进收件箱，
//    履迹里显示成「待处理的邮件」，你点「处理」才会识别入账；其他邮件不看第二眼、不保存
// 授权码只存在本机 mail-pass.txt，履迹页面也读不回来。收信组件（imapflow、mailparser）只在打开后才加载。
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const HIT = /面试|笔试|测评|测试邀请|在线测试|录用|offer|感谢.{0,6}投递|投递.{0,8}(成功|反馈|进展|结果)|简历.{0,6}(通过|筛选|反馈|进展|已收到)|网申|候选人|入职|很遗憾|未能.{0,6}(通过|进入|匹配)|进入下一轮|邀请您参加|interview|assessment|your application/i;
const ADS = /推荐职位|职位推荐|为你推荐|精选|热招|宣讲会预告|直播|订阅|周刊|课程|训练营|招聘会/;
const STRONG = /面试|笔试|测评|录用|offer|很遗憾|interview|assessment/i;

// 像不像招聘通知：标题里有关键词最准；正文只看开头，避免网页邮件末尾的推荐栏误判
export function mailPick(subject = '', text = '') {
  const s = String(subject), body = String(text).slice(0, 1500);
  if (ADS.test(s) && !STRONG.test(s)) return false;
  return HIT.test(s) || (STRONG.test(body) && /您好|你好|同学|候选人|dear/i.test(body));
}

// 猜公司：标题里的【公司名】，或者发件人名字去掉「招聘、HR、校园招聘」这类后缀
export function mailCompany(subject = '', fromName = '') {
  const m = String(subject).match(/[【\[]([^】\]]{2,30})[】\]]/);
  const clean = x => String(x || '').replace(/(校园招聘|社会招聘|校招|社招|招聘中心|招聘团队|招聘|人力资源部?|人才招聘|HR|Recruiting|Talent.*|Careers?|官方|团队|邮件|通知|noreply|no-reply)/gi, '').replace(/[\s·\-_|:：]+$/g, '').replace(/^[\s·\-_|:：]+/g, '').trim();
  const a = m ? clean(m[1]) : '';
  if (a.length >= 2 && !/通知|邀请|面试|笔试|测评|结果/.test(a)) return a.slice(0, 40);
  const b = clean(fromName);
  return b.length >= 2 && !/@/.test(b) ? b.slice(0, 40) : '';
}

export function createMail({ stateDir, push, every = 10 * 60 * 1000 }) {
  const F = path.join(stateDir, 'mail.json'), PF = path.join(stateDir, 'mail-pass.txt');
  let st = { on: false, user: '', lastUid: 0, uidValidity: '', lastCheck: 0, lastError: '', found: 0 };
  try { st = { ...st, ...JSON.parse(fs.readFileSync(F, 'utf8')) }; } catch {}
  let busy = null, timer = null;
  const pass = () => { try { return fs.readFileSync(PF, 'utf8').trim(); } catch { return ''; } };
  const save = () => fsp.writeFile(F, JSON.stringify(st), 'utf8').catch(() => {});
  const info = () => ({ on: st.on, user: st.user, hasPass: !!pass(), lastCheck: st.lastCheck, lastError: st.lastError, found: st.found, busy: !!busy });

  async function check() {
    if (busy) return busy;
    busy = (async () => {
      const user = st.user, pw = pass();
      if (!user || !pw) { st.lastError = '还没填邮箱地址或授权码'; return; }
      let ImapFlow, simpleParser;
      try { ({ ImapFlow } = await import('imapflow')); ({ simpleParser } = await import('mailparser')); }
      catch { st.lastError = '缺少收信组件，重新安装一次履迹试试'; return; }
      const host = /@(qq|foxmail)\.com$/i.test(user) ? 'imap.qq.com' : /@163\.com$/i.test(user) ? 'imap.163.com' : /@126\.com$/i.test(user) ? 'imap.126.com' : 'imap.qq.com';
      const c = new ImapFlow({ host, port: 993, secure: true, auth: { user, pass: pw }, logger: false, socketTimeout: 60000, connectionTimeout: 20000 });
      c.on('error', () => {});
      try {
        await c.connect();
        const lock = await c.getMailboxLock('INBOX', { readOnly: true });
        try {
          const uv = String(c.mailbox.uidValidity || '');
          if (uv !== st.uidValidity) { st.uidValidity = uv; st.lastUid = 0; }
          let uids;
          if (!st.lastUid) uids = await c.search({ since: new Date(Date.now() - 7 * 864e5) }, { uid: true });
          else uids = await c.search({ uid: `${st.lastUid + 1}:*` }, { uid: true });
          uids = (uids || []).filter(u => u > st.lastUid).sort((a, b) => a - b).slice(-200);
          let n = 0;
          if (uids.length) {
            // 先只取标题和发件人，像招聘通知的再取正文
            const heads = [];
            for await (const m of c.fetch(uids.join(','), { uid: true, envelope: true, size: true, internalDate: true }, { uid: true })) heads.push(m);
            for (const m of heads) {
              const subj = m.envelope?.subject || '', from = m.envelope?.from?.[0] || {};
              if (!mailPick(subj, '') && !/hr|招聘|recruit|talent|career|campus|zhaopin|moka|hotjob|beisen|51job|zhipin|nowcoder/i.test(`${from.name || ''} ${from.address || ''}`)) continue;
              if ((m.size || 0) > 2 * 1024 * 1024) continue;
              const dl = await c.download(String(m.uid), undefined, { uid: true });
              const p = await simpleParser(dl.content, { skipImageLinks: true, skipTextToHtml: true });
              const text = String(p.text || '').replace(/\n{3,}/g, '\n\n').trim();
              if (!mailPick(subj, text)) continue;
              const name = from.name || '', addr = from.address || '';
              await push({
                kind: 'mail', channel: '邮箱', company: mailCompany(subj, name), role: '',
                hr: (name ? `${name} <${addr}>` : addr).slice(0, 200), subj: String(subj).slice(0, 300),
                text: `${subj}\n发件人：${name} ${addr}\n\n${text}`.slice(0, 8000), at: +new Date(m.internalDate || Date.now()),
              });
              n++;
            }
            st.lastUid = uids[uids.length - 1];
          }
          st.found += n; st.lastError = '';
        } finally { lock.release(); }
        await c.logout().catch(() => {});
      } catch (e) {
        const t = String(e?.responseText || e?.message || e);
        st.lastError = e?.authenticationFailed || /auth|login|password|LOGIN/i.test(t)
          ? '邮箱或授权码不对（要填授权码，不是 QQ 密码），也可能是邮箱设置里没开 IMAP 服务'
          : /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET|timeout/i.test(t) ? '连不上邮箱服务器，看看网络' : '收信出错：' + t.slice(0, 120);
        try { c.close(); } catch {}
      }
    })().finally(async () => { st.lastCheck = Date.now(); busy = null; await save(); });
    return busy;
  }

  function schedule() {
    clearInterval(timer); timer = null;
    if (st.on) { timer = setInterval(() => check().catch(() => {}), every); timer.unref?.(); }
  }

  async function set(b = {}) {
    if (b.forget) { st = { ...st, on: false, user: '', lastUid: 0, uidValidity: '', lastError: '', found: 0 }; await fsp.unlink(PF).catch(() => {}); }
    if (typeof b.user === 'string') {
      const u = b.user.trim().slice(0, 100);
      if (u && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(u)) throw new Error('邮箱地址格式不对');
      if (u !== st.user) { st.lastUid = 0; st.uidValidity = ''; }
      st.user = u;
    }
    if (typeof b.pass === 'string' && b.pass.trim()) await fsp.writeFile(PF, b.pass.replace(/\s+/g, '').slice(0, 64), 'utf8');
    if (typeof b.on === 'boolean') st.on = b.on && !!st.user && !!pass();
    if (!st.on) st.lastError = '';
    await save(); schedule();
    if (st.on && (b.check || b.on)) await check();
    return info();
  }

  schedule();
  if (st.on) setTimeout(() => check().catch(() => {}), 15000).unref?.();
  return { info, set, check };
}

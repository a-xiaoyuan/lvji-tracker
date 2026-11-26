// 力扣（leetcode.cn）同步：只读公开主页数据，不需要登录，也不保存任何账号信息。
const BASE = 'https://leetcode.cn/graphql/';
const HDR = { 'content-type': 'application/json', referer: 'https://leetcode.cn/', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const cache = new Map();   // user -> { at, data }
const tagCache = new Map(); // slug -> { difficulty, tags }

async function gql(query, variables = {}, ep = '') {
  let r;
  try { r = await fetch(BASE + ep, { method: 'POST', headers: HDR, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(20e3) }); }
  catch { throw new Error('连不上力扣，检查一下网络'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.errors) throw new Error('力扣接口出错：' + (j.errors?.[0]?.message || `HTTP ${r.status}`));
  return j.data;
}

const DIFF = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard', Easy: 'easy', Medium: 'medium', Hard: 'hard' };
const dstr = ms => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

async function tagsFor(slugs) {
  const need = slugs.filter(s => !tagCache.has(s)).slice(0, 25);
  if (need.length) {
    const q = 'query{' + need.map((s, i) => `q${i}:question(titleSlug:${JSON.stringify(s)}){difficulty topicTags{translatedName name}}`).join(' ') + '}';
    const d = await gql(q).catch(() => ({}));
    need.forEach((s, i) => { const x = d?.[`q${i}`]; if (x) tagCache.set(s, { difficulty: DIFF[x.difficulty] || '', tags: (x.topicTags || []).map(t => t.translatedName || t.name).filter(Boolean) }); });
  }
}

export async function lcSync(user, force = false) {
  user = String(user || '').trim();
  if (!/^[A-Za-z0-9_.-]{1,50}$/.test(user)) throw new Error('力扣用户名不对：只能是字母、数字、下划线、短横线');
  const c = cache.get(user);
  if (!force && c && Date.now() - c.at < 3 * 60e3) return c.data;
  const [main, recent, cal, today] = await Promise.all([
    gql('query q($u:String!){userProfilePublicProfile(userSlug:$u){profile{realName userAvatar}} userProfileUserQuestionProgress(userSlug:$u){numAcceptedQuestions{difficulty count} numFailedQuestions{difficulty count} numUntouchedQuestions{difficulty count}}}', { u: user }),
    gql('query q($u:String!){recentACSubmissions(userSlug:$u){submissionId submitTime question{translatedTitle title titleSlug questionFrontendId}}}', { u: user }, 'noj-go/').catch(() => ({ recentACSubmissions: [] })),
    gql('query q($u:String!){userCalendar(userSlug:$u){streak totalActiveDays submissionCalendar}}', { u: user }, 'noj-go/').catch(() => ({})),
    gql('query{todayRecord{date question{questionFrontendId translatedTitle title titleSlug difficulty}}}').catch(() => ({})),
  ]);
  if (!main?.userProfilePublicProfile) throw new Error(`力扣上找不到用户「${user}」，用户名是个人主页网址 leetcode.cn/u/ 后面那段`);
  const P = main.userProfileUserQuestionProgress || {};
  const sum = (L, k) => (L || []).filter(x => DIFF[x.difficulty] === k).reduce((s, x) => s + x.count, 0);
  const solved = {}, total = {};
  for (const k of ['easy', 'medium', 'hard']) { solved[k] = sum(P.numAcceptedQuestions, k); total[k] = solved[k] + sum(P.numFailedQuestions, k) + sum(P.numUntouchedQuestions, k); }
  solved.all = solved.easy + solved.medium + solved.hard; total.all = total.easy + total.medium + total.hard;
  // 最近通过：同一题只留最近一次
  const seen = new Set(), recentL = [];
  for (const s of recent?.recentACSubmissions || []) { const q = s.question || {}; if (!q.titleSlug || seen.has(q.titleSlug)) continue; seen.add(q.titleSlug); recentL.push({ id: q.questionFrontendId, title: q.translatedTitle || q.title, slug: q.titleSlug, time: (+s.submitTime || 0) * 1000 }); }
  await tagsFor(recentL.map(x => x.slug));
  for (const x of recentL) Object.assign(x, tagCache.get(x.slug) || { difficulty: '', tags: [] });
  const calendar = {};
  try { for (const [ts, n] of Object.entries(JSON.parse(cal?.userCalendar?.submissionCalendar || '{}'))) { const d = dstr(+ts * 1000); calendar[d] = (calendar[d] || 0) + n; } } catch {}
  const t = today?.todayRecord?.[0]?.question;
  const data = {
    user, name: main.userProfilePublicProfile.profile?.realName || user, avatar: main.userProfilePublicProfile.profile?.userAvatar || '',
    solved, total, streak: cal?.userCalendar?.streak || 0, activeDays: cal?.userCalendar?.totalActiveDays || 0, calendar, recent: recentL,
    daily: t ? { id: t.questionFrontendId, title: t.translatedTitle || t.title, slug: t.titleSlug, difficulty: DIFF[t.difficulty] || '', date: today.todayRecord[0].date } : null,
    at: Date.now(),
  };
  cache.set(user, { at: Date.now(), data });
  return data;
}

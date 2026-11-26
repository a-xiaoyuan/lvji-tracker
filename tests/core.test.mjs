// 履迹页面里的核心纯函数：数据修复、多窗口合并、批量导入解析、AI 返回解析、面试邀请识别、公司查重……
// 运行：node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './extract.mjs';

const F = load(['ST', 'DEF_HABITS', 'DEF_TPL', 'pad', 'dstr', 'today', 'dayDiff', 'uid', 'newApp', 'normalize', 'mergeDb',
  'CITY', 'CH_ALIAS', 'parseLine', 'aiJSON', 'looksInvite', 'coKey', 'sameCo', 'safeUrl', 'esc']);
const plain = x => JSON.parse(JSON.stringify(x)); // vm 里的对象换成本环境的，deepEqual 才比得上

test('normalize：空数据也能得到完整结构', () => {
  const d = F.normalize(null);
  assert.deepEqual(plain(d.apps), []);
  for (const k of ['journal', 'habits', 'skills', 'stories', 'people', 'mocks', 'chat', 'tpls']) assert.ok(Array.isArray(d[k]), k);
  assert.equal(d.settings.weekGoal, 10);
});

test('normalize：坏记录被修正而不是让页面崩溃', () => {
  const d = F.normalize({ apps: [
    null, 'str', 42,
    { id: 'a', company: null, role: 5, status: '??', appliedAt: 'not-a-date', events: {}, history: 'x', offer: 'y' },
    { id: 'b', company: '星河云', events: [null, { type: 'interview', at: '2026-12-01T10:00' }] },
  ] });
  assert.equal(d.apps.length, 2, '非对象的记录被丢掉');
  const [a, b] = d.apps;
  assert.equal(a.company, ''); assert.equal(a.role, '5');
  assert.equal(a.status, 'applied', '不认识的状态改成已投递');
  assert.match(a.appliedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(a.events) && Array.isArray(a.history));
  assert.equal(typeof a.offer, 'object');
  assert.equal(b.events.length, 1, '空事件被丢掉');
  assert.ok(b.events[0].id, '事件补上 id');
  assert.equal(b.events[0].done, false);
});

test('normalize：合法数据原样保留', () => {
  const d = F.normalize({ apps: [{ id: 'x1', company: '蓝鲸数据', role: '后端', status: 'interview', appliedAt: '2026-11-20', city: '杭州' }] });
  const a = d.apps[0];
  assert.equal(a.id, 'x1'); assert.equal(a.status, 'interview'); assert.equal(a.appliedAt, '2026-11-20'); assert.equal(a.city, '杭州');
});

test('mergeDb：两个窗口各加了一条，合并后都在', () => {
  const theirs = { apps: [{ id: '1', company: 'A', updatedAt: 1 }, { id: '2', company: 'B', updatedAt: 5 }] };
  const mine = { apps: [{ id: '1', company: 'A', updatedAt: 1 }, { id: '3', company: 'C', updatedAt: 6 }] };
  assert.deepEqual(plain(F.mergeDb(theirs, mine).apps.map(a => a.id)).sort(), ['1', '2', '3']);
});

test('mergeDb：同一条两边都改了，取更新的那份', () => {
  const theirs = { apps: [{ id: '1', status: 'offer', updatedAt: 20 }] };
  const mine = { apps: [{ id: '1', status: 'interview', updatedAt: 10 }] };
  assert.equal(F.mergeDb(theirs, mine).apps[0].status, 'offer');
  assert.equal(F.mergeDb(mine, theirs).apps[0].status, 'offer');
});

test('mergeDb：同一条收件箱记录只保留一份', () => {
  const theirs = { apps: [{ id: 'w1', inboxId: 'in9', company: '星河云', updatedAt: 1 }] };
  const mine = { apps: [{ id: 'w2', inboxId: 'in9', company: '星河云', updatedAt: 2 }] };
  assert.equal(F.mergeDb(theirs, mine).apps.length, 1);
});

test('mergeDb：设置按键合并，本窗口优先；没有 id 的列表用本窗口的', () => {
  const m = F.mergeDb({ settings: { weekGoal: 10, theme: 'dark' }, qmark: { q1: 'ok' }, focus: [1, 2] },
    { settings: { weekGoal: 15 }, qmark: { q2: 'weak' }, focus: [3] });
  assert.deepEqual(plain(m.settings), { weekGoal: 15, theme: 'dark' });
  assert.deepEqual(plain(m.qmark), { q1: 'ok', q2: 'weak' });
  assert.deepEqual(plain(m.focus), [3]);
});

test('mergeDb：一边缺字段时用另一边的；坏输入不报错', () => {
  assert.deepEqual(plain(F.mergeDb({ apps: [{ id: '1' }] }, {}).apps), [{ id: '1' }]);
  assert.deepEqual(plain(F.mergeDb(null, { apps: [] }).apps), []);
});

test('parseLine：批量导入的一行文字拆成字段', () => {
  const o = F.parseLine('星河云 Java开发 杭州 15-25K boss https://www.zhipin.com/job_detail/abc.html');
  assert.equal(o.company, '星河云'); assert.equal(o.role, 'Java开发'); assert.equal(o.city, '杭州');
  assert.equal(o.salary, '15-25K'); assert.equal(o.channel, 'Boss直聘'); assert.match(o.link, /^https:/);
  const t = F.parseLine('蓝鲸数据，后端开发，上海市，已投');
  assert.equal(t.company, '蓝鲸数据'); assert.equal(t.city, '上海'); assert.equal(t.status, 'applied');
});

test('aiJSON：能读出带代码块、带前后废话的 JSON，读不出时给中文提示', () => {
  assert.deepEqual(plain(F.aiJSON('```json\n{"a":1}\n```')), { a: 1 });
  assert.deepEqual(plain(F.aiJSON('好的，结果如下：{"at":"2026-12-01T10:00","round":"一面"} 祝顺利')), { at: '2026-12-01T10:00', round: '一面' });
  assert.throws(() => F.aiJSON('没有 JSON'), /格式不对/);
});

test('looksInvite：真正的面试邀请才算', () => {
  assert.ok(F.looksInvite('您好，邀请您明天下午3点参加技术面，腾讯会议号 123'));
  assert.ok(F.looksInvite('周三 14:00 二面，飞书会议'));
  assert.ok(!F.looksInvite('您好，看了您的简历，方便发一份作品集吗'), '没有时间不算');
  assert.ok(!F.looksInvite('明天下午 3 点前回复一下'), '没提面试不算');
});

test('coKey / sameCo：公司名去掉后缀再比', () => {
  assert.ok(F.sameCo('杭州星河云科技有限公司', '星河云'));
  assert.ok(F.sameCo('蓝鲸数据（上海）', '蓝鲸数据'));
  assert.ok(!F.sameCo('星河云', '北辰数据'));
  assert.ok(!F.sameCo('', ''), '空名字不算同一家');
});

test('safeUrl / esc：只放行 http(s)，HTML 转义', () => {
  assert.equal(F.safeUrl('javascript:alert(1)'), '');
  assert.equal(F.safeUrl('www.nowcoder.com/jobs/detail/1'), 'https://www.nowcoder.com/jobs/detail/1');
  assert.equal(F.safeUrl(''), '');
  assert.equal(F.esc('<img src=x onerror="a">'), '&lt;img src=x onerror=&quot;a&quot;&gt;');
});

test('dayDiff：按日期算相差几天', () => {
  assert.equal(F.dayDiff('2026-12-01', '2026-11-26'), 5);
  assert.equal(F.dayDiff('2026-11-26', '2026-11-26'), 0);
});

/* ---------- 四个新功能：定制简历 / 岗位订阅 / 通知入账 ---------- */
const TG = load(['inResume', 'tailorGaps', 'tailorTitle']);
test('tailorGaps：按 JD 关键词算简历覆盖', () => {
  const F2 = [{ k: 'Redis' }, { k: 'Kafka' }, { k: 'Spring Boot' }];
  const g = TG.tailorGaps(F2, '熟悉 Spring Boot 与 Redis，做过缓存设计。');
  assert.equal(g.hit.join(','), 'Redis,Spring Boot');
  assert.equal(g.miss.join(','), 'Kafka');
  assert.equal(g.score, 67);
  assert.equal(TG.tailorGaps([], 'x').score, 0);
});
test('tailorTitle：专属版名字带公司', () => {
  assert.equal(TG.tailorTitle({ company: '星云科技' }), '星云科技 定制版');
});

const SJ = load(['coKey', 'jobKey', 'scoreJob', 'newJobs']);
test('scoreJob：技能命中和岗位名都对上时高分', () => {
  const skills = [{ name: 'Redis' }, { name: 'Kafka' }];
  const full = SJ.scoreJob({ company: '甲公司', role: 'Java 后端工程师', jd: '需要 Redis、Kafka 经验', why: '' }, skills, '后端');
  assert.equal(full.score, 100);
  assert.equal(full.hits.join(','), 'Redis,Kafka');
  const none = SJ.scoreJob({ company: '乙公司', role: '产品经理', jd: '负责需求文档', why: '' }, skills, '后端');
  assert.equal(none.score, 0);
});
test('newJobs：见过的和已在跟进的都不算新', () => {
  const list = [{ company: '甲公司', role: 'Java后端' }, { company: '乙公司', role: '前端工程师' }, { company: '丙公司', role: '测试工程师' }];
  const seen = [SJ.jobKey(list[0])];
  const apps = [{ company: '丙公司', role: '测试工程师' }];
  assert.equal(SJ.newJobs(list, seen, apps).map(x => x.company).join(','), '乙公司');
});

const CN = load(['pad', 'dstr', 'today', 'classifyNotice']);
test('classifyNotice：面试邀请认出类型和时间', () => {
  const c = CN.classifyNotice('您好，邀请您参加我司 Java 工程师岗位的面试，时间 11月28日 下午2:30，腾讯会议 123-456-789', '2026-11-26');
  assert.equal(c.kind, 'interview');
  assert.equal(c.at, '2026-11-28T14:30');
});
test('classifyNotice：笔试、录用、拒信分得清', () => {
  assert.equal(CN.classifyNotice('请于 2026-11-29 10:00 前完成在线测评（笔试），链接见正文', '2026-11-26').kind, 'test');
  assert.equal(CN.classifyNotice('请于 2026-11-29 10:00 前完成在线测评（笔试），链接见正文', '2026-11-26').at, '2026-11-29T10:00');
  assert.equal(CN.classifyNotice('恭喜您通过面试，我司决定录用，请于下周办理入职手续。', '2026-11-26').kind, 'offer');
  assert.equal(CN.classifyNotice('感谢您投递我司岗位。很遗憾，您未能通过本轮筛选，祝您求职顺利。', '2026-11-26').kind, 'rejected');
});
test('classifyNotice：相对日期（明天）也能算', () => {
  const c = CN.classifyNotice('请明天上午10点参加视频面试，提前 10 分钟进入会议', '2026-11-26');
  assert.equal(c.kind, 'interview');
  assert.equal(c.at, '2026-11-27T10:00');
});

/* ---------- 订阅自动扫描 ---------- */
const DS = load(['dueSubs']);
test('dueSubs：没扫过和超过 24 小时的算到期', () => {
  const now = 1764244800000;
  const subs = [{ id: 'a', lastRun: 0 }, { id: 'b', lastRun: now - 25 * 3600e3 }, { id: 'c', lastRun: now - 3600e3 }];
  assert.equal(DS.dueSubs(subs, now).map(x => x.id).join(','), 'a,b');
  assert.equal(DS.dueSubs([], now).length, 0);
});

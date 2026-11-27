// 履迹页面里的核心纯函数：数据修复、多窗口合并、批量导入解析、AI 返回解析、面试邀请识别、公司查重……
// 运行：node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './extract.mjs';

const F = load(['ST', 'DEF_HABITS', 'DEF_TPL', 'pad', 'dstr', 'today', 'dayDiff', 'uid', 'newApp', 'normalize', 'mergeDb',
  'CITY', 'CH_ALIAS', 'parseLine', 'aiJSON', 'looksInvite', 'coKey', 'sameCo', 'safeUrl', 'esc']);
const plain = x => JSON.parse(JSON.stringify(x)); // vm 里的对象换成本环境的，deepEqual 才比得上
const QF = load(['dayDiff', 'waitFor', 'buildTodayQueue']);

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

/* ---------- 模拟弱项 → 题库专项 ---------- */
const WQ = load(['weakCounts', 'weakQuestions']);
test('weakCounts：统计复盘和模拟里反复出现的弱项', () => {
  const evs = [{ weak: ['项目深挖', '算法题'] }, { weak: ['项目深挖'] }, { weak: [] }, {}, { weak: ['算法题', '表达沟通'] }];
  const r = WQ.weakCounts(evs);
  assert.equal(r[0].tag, '项目深挖');
  assert.equal(r[0].n, 2);
  assert.equal(r[1].tag, '算法题');
  assert.equal(WQ.weakCounts([]).length, 0);
});
test('weakQuestions：只留下出自弱项场次的题目', () => {
  const Q = [{ h: '1', e: { weak: ['项目深挖'] } }, { h: '2', e: { weak: ['算法题'] } }, { h: '3', e: {} }];
  assert.equal(WQ.weakQuestions(Q, ['项目深挖']).map(x => x.h).join(','), '1');
  assert.equal(WQ.weakQuestions(Q, []).length, 0);
});
test('JD 红旗检测：收费和培训贷是高危，加班话术是提醒', () => {
  const F = load(['RED_RULES', 'redFlags']);
  const bad = F.redFlags('本岗位先培训后上岗，0元入学，入职需交服装费和押金，表现好月入过万不是梦。我们提供系统培训和就业保障。');
  assert.ok(bad.some(f => f.lv === 'bad' && f.t.includes('培训贷')), JSON.stringify(bad));
  assert.ok(bad.some(f => f.t.includes('交钱')));
  const warn = F.redFlags('要求抗压能力强，能吃苦耐劳，公司实行大小周，薪资面议，期待有狼性的你加入我们团队，一起成长。');
  assert.ok(warn.length >= 2 && warn.every(f => f.lv === 'warn'), JSON.stringify(warn));
  assert.equal(F.redFlags('负责后端服务开发，要求熟悉 Java 和 Spring Boot，有良好的编码习惯和团队协作能力，双休。').length, 0);
  assert.equal(F.redFlags('大小周').length, 0); // 太短不判断
  // 常见的正常写法不算红旗
  assert.equal(F.redFlags('入职体检费自理，公司实行弹性工作制，双休，负责后端服务开发和维护，熟悉 Java。').length, 0);
});

test('海报数据和吉祥物阶段', () => {
  const F = load(['dayDiff', 'posterStats', 'mascotStage'], { today: () => '2026-11-26' });
  const d = { settings: { startDate: '2026-11-20' }, milestones: [{ date: '2026-11-21', title: '第一次面试' }], apps: [
    { status: 'offer', appliedAt: '2026-11-20', events: [{ type: 'interview' }, { type: 'test' }] },
    { status: 'applied', appliedAt: '2026-11-22', events: [] }] };
  const S = F.posterStats(d, 42);
  assert.equal(S.days, 7); assert.equal(S.sent, 2); assert.equal(S.iv, 1); assert.equal(S.ts, 1); assert.equal(S.offers, 1); assert.equal(S.qn, 42);
  assert.equal(F.mascotStage(d.apps).e, '😎');
  assert.equal(F.mascotStage([{ status: 'applied', events: [] }]).e, '🏃');
  assert.equal(F.mascotStage([{ status: 'wish', events: [] }]).e, '🌱');
  assert.equal(F.mascotStage([{ status: 'applied', events: [{ type: 'interview', done: false }] }]).e, '👔');
});

/* ---------- 今日行动队列 buildTodayQueue ---------- */
// 固定今天 2026-11-26、明天 2026-11-27；假公司名，不用真实数据
const TD = '2026-11-26', TM = '2026-11-27';
// 渠道回复统计：官网 med 3 / p80 4 → 门槛 6 天；全部渠道 med 5 / p80 7 → 门槛 9 天（waitFor 的算法）
const RS = { _all: { n: 5, med: 5, p80: 7 }, '官网': { n: 4, med: 3, p80: 4 } };
const mkApp = p => Object.assign({ id: 'x', company: '甲公司', role: '后端开发', channel: 'Boss直聘', status: 'applied', appliedAt: '', due: '', snooze: '', events: [], offer: {} }, p);
const kinds = Q => plain(Q).map(x => x.kind);

test('buildTodayQueue：截止临近的待投递进队列，远的和已结束的不进', () => {
  const Q = QF.buildTodayQueue([
    mkApp({ id: 'a1', status: 'wish', due: '2026-11-26' }),
    mkApp({ id: 'a2', status: 'wish', due: '2026-11-29' }),
    mkApp({ id: 'a3', status: 'wish', due: '2026-11-30' }),
    mkApp({ id: 'a4', status: 'wish', due: '2026-11-25' }),
    mkApp({ id: 'a5', status: 'rejected', due: '2026-11-26' }),
    mkApp({ id: 'a6', status: 'applied', due: '2026-11-26', appliedAt: '2026-11-25' }),
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['a4', 'a1', 'a2'], '已过期的最靠前，其次今天、3 天内；4 天后和已结束的不进');
  assert.ok(Q.every(x => x.kind === 'due' && x.what === 'wish'));
});
test('buildTodayQueue：心愿单过期超过 3 天就不再提醒', () => {
  const Q = QF.buildTodayQueue([
    mkApp({ id: 'w1', status: 'wish', due: '2026-11-23' }),
    mkApp({ id: 'w2', status: 'wish', due: '2026-11-22' }),
    mkApp({ id: 'w3', status: 'wish', due: '2026-10-01' }),
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['w1']);
});

test('buildTodayQueue：Offer 截止答复也算截止事项', () => {
  const Q = QF.buildTodayQueue([
    mkApp({ id: 'o1', status: 'offer', offer: { deadline: '2026-11-28' } }),
    mkApp({ id: 'o2', status: 'offer', offer: { deadline: '2026-12-05' } }),
    mkApp({ id: 'o3', status: 'offer', offer: { deadline: '2026-11-25' } }),
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['o1']);
  assert.equal(Q[0].what, 'offer'); assert.equal(Q[0].days, 2);
});

test('buildTodayQueue：明天的面试和笔试进队列（按时间排），今天的、后天的、已完成的不进', () => {
  const ev = (id, type, at, done) => ({ id, type, at, done: !!done, title: '技术面' });
  const Q = QF.buildTodayQueue([
    mkApp({ id: 'i1', status: 'interview', events: [ev('e1', 'interview', '2026-11-27T10:00')] }),
    mkApp({ id: 'i2', status: 'interview', events: [ev('e2', 'interview', '2026-11-26T10:00')] }),
    mkApp({ id: 'i3', status: 'interview', events: [ev('e3', 'interview', '2026-11-28T10:00')] }),
    mkApp({ id: 'i4', status: 'interview', events: [ev('e4', 'interview', '2026-11-27T14:00', true)] }),
    mkApp({ id: 'i5', status: 'test', events: [ev('e5', 'test', '2026-11-27T09:00')] }),
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['i5', 'i1']);
  assert.equal(Q[0].etype, 'test'); assert.equal(Q[1].kind, 'prep'); assert.equal(Q[1].event, 'e1');
});

test('buildTodayQueue：没动静按本渠道的回复门槛判断，别的渠道用整体门槛', () => {
  const Q = QF.buildTodayQueue([
    mkApp({ id: 's1', channel: '官网', appliedAt: '2026-11-20' }), // 等了 6 天 = 官网门槛，进
    mkApp({ id: 's2', channel: '官网', appliedAt: '2026-11-21' }), // 等了 5 天 < 门槛，不进
    mkApp({ id: 's3', channel: 'Boss直聘', appliedAt: '2026-11-17' }), // 等了 9 天 = 整体门槛，进
    mkApp({ id: 's4', channel: 'Boss直聘', appliedAt: '2026-11-18' }), // 等了 8 天 < 门槛，不进
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['s3', 's1'], '等得久的排前面');
  const s1 = Q.find(x => x.app === 's1');
  assert.equal(s1.wait, 6); assert.equal(s1.med, 3); assert.equal(s1.days, 6);
});

test('buildTodayQueue：推迟提醒的、投递后有过动静的、不是已投递状态的不算没动静', () => {
  const Q = QF.buildTodayQueue([
    mkApp({ id: 'n1', channel: '官网', appliedAt: '2026-11-10', snooze: '2026-12-01' }),
    mkApp({ id: 'n2', channel: '官网', appliedAt: '2026-11-10', events: [{ id: 'e9', type: 'followup', at: '2026-11-15T09:00', done: true }] }),
    mkApp({ id: 'n3', channel: '官网', appliedAt: '2026-11-10', status: 'interview' }),
    mkApp({ id: 'n4', channel: '官网', appliedAt: '2026-11-10', snooze: '2026-11-20' }),
  ], TD, TM, RS, 0);
  assert.deepEqual(plain(Q).map(x => x.app), ['n4'], '只剩推迟已过期的那条');
});

test('buildTodayQueue：复习题只有数量大于 0 时才进，且排在最后', () => {
  assert.deepEqual(kinds(QF.buildTodayQueue([], TD, TM, RS, 0)), []);
  const Q = QF.buildTodayQueue([mkApp({ id: 'a1', status: 'wish', due: '2026-11-26' })], TD, TM, RS, 5);
  assert.deepEqual(kinds(Q), ['due', 'review']);
  assert.equal(Q[1].n, 5);
});

test('buildTodayQueue：整体按紧急程度排序，坏数据不报错', () => {
  const Q = QF.buildTodayQueue([
    null, 'x', {},
    mkApp({ id: 's1', channel: '官网', appliedAt: '2026-11-19' }),
    mkApp({ id: 'i1', status: 'interview', events: [{ id: 'e1', type: 'interview', at: '2026-11-27T09:00', done: false }] }),
    mkApp({ id: 'a1', status: 'wish', due: '2026-11-28' }),
  ], TD, TM, RS, 2);
  assert.deepEqual(kinds(Q), ['due', 'prep', 'stale', 'review']);
  assert.deepEqual(plain(QF.buildTodayQueue(null, TD, TM, RS, 0)), []);
});

test('话术效果、人脉雷达、时机洞察、海投疲劳', () => {
  const F = load(['dayDiff', 'appReplied', 'tplStats', 'peopleNamesFor', 'jobInsights', 'fatigueTip'], { today: () => '2026-11-26' });
  const tpls = [{ id: 't1', title: '打招呼' }, { id: 't2', title: '内推' }];
  const apps = [
    { status: 'interview', tplUse: [{ tpl: 't1' }] }, { status: 'applied', tplUse: [{ tpl: 't1' }] }, { status: 'applied', tplUse: [{ tpl: 't2' }] }];
  const S = F.tplStats(apps, tpls);
  assert.equal(S[0].id, 't1'); assert.equal(S[0].used, 2); assert.equal(S[0].replied, 1);
  assert.equal(F.peopleNamesFor('字节跳动', [{ name: '张三', company: '字节' }]).join(','), '张三');
  assert.equal(F.peopleNamesFor('美团', [{ name: '张三', company: '字节' }]).length, 0);
  const many = [];
  for (let i = 0; i < 5; i++) many.push({ status: 'interview', channel: '官网', appliedAt: '2026-11-24', events: [{ type: 'interview', at: '2026-11-26 10:00' }] });
  for (let i = 0; i < 5; i++) many.push({ status: 'applied', channel: 'Boss直聘', appliedAt: '2026-11-25', events: [] });
  const ins = F.jobInsights(many).join(' ');
  assert.ok(ins.includes('周二') && ins.includes('官网回复最快'), ins);
  const tired = []; for (let i = 0; i < 6; i++) tired.push({ status: 'applied', appliedAt: '2026-11-25', events: [] });
  assert.ok(F.fatigueTip(tired).length > 0);
  tired[0].status = 'interview';
  assert.equal(F.fatigueTip(tired), '');
});

test('appReplied：自己写的笔记、跟进、模拟面试不算对方回复', () => {
  const F = load(['appReplied']);
  assert.equal(F.appReplied({ status: 'applied', events: [{ type: 'note', done: true, title: 'AI 模拟面试' }] }), false);
  assert.equal(F.appReplied({ status: 'applied', events: [{ type: 'followup', done: true }] }), false);
  assert.equal(F.appReplied({ status: 'applied', events: [{ type: 'test', at: '2026-11-27T10:00' }] }), true);
  assert.equal(F.appReplied({ status: 'rejected', fail: { reasons: ['没回音'] }, events: [] }), false);
  assert.equal(F.appReplied({ status: 'rejected', fail: { reasons: ['算法题'] }, events: [] }), true);
  assert.equal(F.appReplied({ status: 'wish', events: [{ type: 'interview' }] }), false);
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
test('classifyNotice：拒信里提到 offer 不算录用；通过一面邀请下一轮算面试', () => {
  assert.equal(CN.classifyNotice('很遗憾，您未能获得本次 offer，祝求职顺利', '2026-11-26').kind, 'rejected');
  assert.equal(CN.classifyNotice('恭喜您通过初面！邀请您参加 11月28日 下午3点 的复试面试', '2026-11-26').kind, 'interview');
  assert.equal(CN.classifyNotice('我们很高兴向您发放正式 offer，请查收附件中的 offer letter', '2026-11-26').kind, 'offer');
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

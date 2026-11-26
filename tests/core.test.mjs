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

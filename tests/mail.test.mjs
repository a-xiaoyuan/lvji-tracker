// 邮箱收信 helper/mail.mjs：挑招聘邮件、猜公司名（纯函数，不连真实邮箱）
import test from 'node:test';
import assert from 'node:assert/strict';
import { mailPick, mailCompany } from '../helper/mail.mjs';

test('mailPick：招聘通知收下，广告和无关邮件不收', () => {
  for (const s of ['【北海星图】面试邀请', '感谢您投递蓝鲸云科技', '笔试通知：请于本周完成在线测评', '很遗憾地通知您', 'Your application to Acme', '录用通知书']) assert.equal(mailPick(s, ''), true, s);
  for (const s of ['为你推荐职位：前端开发', '您的快递已签收', '本周课程精选', '会员到期提醒']) assert.equal(mailPick(s, ''), false, s);
  assert.equal(mailPick('一封信', '同学你好，邀请你参加我司面试'), true, '标题看不出来时看正文开头');
  assert.equal(mailPick('一封信', '这是一段普通正文'), false);
});

test('mailCompany：从标题括号或发件人名字猜公司', () => {
  assert.equal(mailCompany('【北海星图】面试邀请', ''), '北海星图');
  assert.equal(mailCompany('面试通知', '蓝鲸云科技校园招聘'), '蓝鲸云科技');
  assert.equal(mailCompany('【面试通知】请查收', '蓝鲸云 HR'), '蓝鲸云');
  assert.equal(mailCompany('通知', 'hr@example.com'), '');
});

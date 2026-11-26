// 履迹助手 · 在 牛客网 上运行
// 1. 你在职位页点「立即申请」并确认投递后，把这个岗位记到履迹（已投递）
// 2. 点「去官网投递 / 网申」这类按钮时，先记成「待投递」，提醒你去官网填完
// 3. 左下角的小按钮可以把正在看的岗位先收藏到履迹
// 只读取你正在看的页面，不会替你点任何按钮，也不会访问牛客的接口。
(() => {
  if (window.__lvjiNk) return; window.__lvjiNk = true;
  const { T, q, cityOf, send, whyText, makeChip } = window.LV;
  const CH = '牛客'; // 和履迹里的渠道名一致，方便按渠道筛选
  const miss = (stage, why) => window.LV.miss('牛客网', stage, why);
  const isDetail = () => /\/jobs\/detail\/\d+/.test(location.pathname);

  function jobInfo() {
    // 标题格式：「岗位_公司名校招_牛客网」/「岗位_公司名实习_牛客网」
    const parts = document.title.split('_');
    const fromTitle = parts.length >= 3 ? parts[parts.length - 2].replace(/(校招|实习|社招|招聘)$/, '').trim() : '';
    const role = q('.job-detail-wrap h1.title|.job-detail-wrap h1|h1') || parts[0] || '';
    const company = fromTitle || q('.company-card .mt-3|.company-card [class*=name]') || '';
    const extra = q('.job-detail-wrap .extra .el-tooltip|.job-detail-wrap .extra');
    let jd = T(document.querySelector('.job-detail-infos'));
    jd = jd.replace(/^岗位关键词[\s\S]*?(?=岗位职责|职位描述|工作内容)/, '').trim();
    const salary = q('.job-detail-wrap .salary');
    return { role, company, jd: jd.slice(0, 6000), link: location.origin + location.pathname,
      salary: /\d/.test(salary) ? salary.replace(/\s*\*\s*/, '·') : '',
      city: cityOf(extra) || cityOf(q('.company-card .company-tags')), hr: q('.job-detail-wrap .one-line .fs-16') };
  }
  const keyOf = j => 'job|' + (j.link || (j.company + '|' + j.role));

  async function record(j, status, note) {
    const r = await send({ kind: 'job', status, channel: CH, ...j, jd: note ? note + '\n\n' + j.jd : j.jd }, keyOf(j) + '|' + status);
    if (r.ok && !r.dup) chip.flash(status === 'wish' ? `☆ 已记到履迹（待投递）：${j.company} · ${j.role}` : `✓ 已记到履迹：${j.company} · ${j.role}`);
    else if (!r.ok && r.why !== 'off') chip.flash(whyText(r), true);
  }

  // 点了「立即申请」后，牛客一般会弹出选简历的对话框；在对话框里点确认才算投递成功。
  // 如果按钮直接变成「已申请 / 已投递」，也算成功。没确认就关掉对话框则不记。
  let pending = null;
  const APPLY = /^(立即申请|立即投递|投递简历|申请职位|一键投递)$/;
  const OFFICIAL = /官网|网申|去投递/;
  const CONFIRM = /^(确定|确认|确认投递|确认申请|投递|提交|提交申请|立即投递)$/;
  const DONE = /已申请|已投递|投递成功|申请成功/;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('a,button,[role=button],[class*=btn]');
    if (!b) return;
    const t = T(b).replace(/\s+/g, '');
    if (isDetail() && b.closest('.job-detail-wrap') && OFFICIAL.test(t) && t.length < 10) {
      const j = jobInfo(); if (j.company || j.role) setTimeout(() => record(j, 'wish', '（从牛客跳转到公司官网投递，记得在官网填完网申后把状态改成「已投递」）'), 300);
      return;
    }
    if (isDetail() && APPLY.test(t)) {
      const j = jobInfo(); if (!j.company && !j.role) { miss('点立即申请', '点了「' + t + '」，但页面上没认出公司和岗位（可能是牛客改版了）'); chip.flash('这次没认出岗位，已记进自检记录', true); return; }
      const mine = pending = { j, at: Date.now(), btn: b };
      // 3 分钟内既没看到确认按钮被点、也没看到「已申请」：记一笔（也可能只是你取消了）
      setTimeout(() => { if (pending === mine) { pending = null; miss('确认投递', `点了「立即申请」后 3 分钟内没看到投递成功（如果是你自己取消的可以忽略）：${j.company} ${j.role}`); } }, 3 * 60e3);
      // 一键投递：按钮文字变成「已申请」
      let n = 0; const iv = setInterval(() => {
        if (!pending || ++n > 20) return clearInterval(iv);
        if (DONE.test(T(pending.btn)) || [...document.querySelectorAll('.el-message,.el-notification,[class*=toast],[class*=message-box]')].some(x => DONE.test(T(x)))) { const p = pending; pending = null; clearInterval(iv); record(p.j, 'applied'); }
      }, 500);
      return;
    }
    if (pending && Date.now() - pending.at < 3 * 60e3 && CONFIRM.test(t) && b.closest('.el-dialog,.el-message-box,[class*=dialog],[class*=modal],[role=dialog]')) {
      const p = pending; pending = null; setTimeout(() => record(p.j, 'applied'), 300);
    }
  }, true);

  const chip = makeChip({ isJobPage: () => isDetail() && !!document.querySelector('.job-detail-wrap,h1'), getJob: jobInfo, channel: CH });

  // 自检：打开职位页 5 秒后试读一次，读不出就记一笔
  let checked = '';
  setInterval(() => {
    const p = location.pathname;
    if (checked === p || !isDetail()) return;
    checked = p;
    setTimeout(() => {
      const j = jobInfo();
      const lost = [!j.company && '公司', !j.role && '岗位', !j.jd && '职位描述', !document.querySelector('.job-detail-wrap') && '职位信息区'].filter(Boolean);
      if (lost.length) miss('读取职位页', `职位页上没认出：${lost.join('、')}`);
    }, 5000);
  }, 2000);
})();

// 履迹助手 · 在 智联招聘 上运行
// 1. 你在职位页点「立即投递 / 申请职位」并确认后，把这个岗位记到履迹（已投递）
// 2. 左下角的小按钮可以把正在看的岗位先收藏到履迹
// 只读取你正在看的页面，不会替你点任何按钮，也不会访问智联的接口。
(() => {
  if (window.__lvjiZl) return; window.__lvjiZl = true;
  const { T, q, cityOf, send, whyText, makeChip } = window.LV;
  const CH = '智联'; // 和履迹里的渠道名一致，方便按渠道筛选
  const miss = (stage, why) => window.LV.miss('智联招聘', stage, why);
  const isDetail = () => /\/jobdetail\//.test(location.pathname) || /^jobs\./.test(location.hostname);

  function jobInfo() {
    // 标题兜底：「岗位_公司_智联招聘」一类格式
    const parts = document.title.split(/[_|｜]/).map(x => x.trim()).filter(Boolean);
    const role = q('.job-detail-box h1|.summary-plane__title|.job-title|h1') || (parts[0] || '').replace(/招聘$/, '');
    const company = q('.company-name|.company-info .name|[class*=company-name]|.job-company-name') || (parts.length >= 2 ? parts[1].replace(/招聘$/, '') : '');
    const salary = q('.summary-plane__salary|.job-salary|[class*=salary]');
    let jd = T(document.querySelector('.describtion,.job-detail-box .desc,[class*=job-desc],[class*=description]'));
    if (jd.length < 40) jd = (document.body.innerText || '').slice(0, 4000);
    return { role, company, jd: jd.slice(0, 6000), link: location.origin + location.pathname,
      salary: /\d/.test(salary) ? salary.slice(0, 40) : '',
      city: cityOf(q('.job-address,[class*=address],[class*=location]')) || cityOf(document.title) || cityOf((document.body.innerText || '').slice(0, 2000)), hr: '' };
  }
  const keyOf = j => 'job|' + (j.link || (j.company + '|' + j.role));

  async function record(j, status) {
    const r = await send({ kind: 'job', status, channel: CH, ...j }, keyOf(j) + '|' + status);
    if (r.ok && !r.dup) chip.flash(status === 'wish' ? `☆ 已记到履迹（待投递）：${j.company} · ${j.role}` : `✓ 已记到履迹：${j.company} · ${j.role}`);
    else if (!r.ok && r.why !== 'off') chip.flash(whyText(r), true);
  }

  let pending = null;
  const APPLY = /^(立即投递|立即申请|申请职位|投递简历|一键投递)$/;
  const CONFIRM = /^(确定|确认|确认投递|确认申请|投递|提交|提交申请)$/;
  const DONE = /已投递|投递成功|已申请|申请成功/;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('a,button,[role=button],[class*=btn]');
    if (!b) return;
    const t = T(b).replace(/\s+/g, '');
    if (isDetail() && APPLY.test(t)) {
      const j = jobInfo();
      if (!j.company && !j.role) { miss('点立即投递', '点了「' + t + '」，但页面上没认出公司和岗位（可能是智联改版了）'); chip.flash('这次没认出岗位，已记进自检记录', true); return; }
      const mine = pending = { j, at: Date.now(), btn: b };
      setTimeout(() => { if (pending === mine) { pending = null; miss('确认投递', `点了「立即投递」后 3 分钟内没看到投递成功（如果是你自己取消的可以忽略）：${j.company} ${j.role}`); } }, 3 * 60e3);
      let n = 0; const iv = setInterval(() => {
        if (!pending || ++n > 20) return clearInterval(iv);
        if (DONE.test(T(pending.btn)) || [...document.querySelectorAll('[class*=toast],[class*=message],[class*=dialog],[class*=modal]')].some(x => DONE.test(T(x)))) { const p = pending; pending = null; clearInterval(iv); record(p.j, 'applied'); }
      }, 500);
      return;
    }
    if (pending && Date.now() - pending.at < 3 * 60e3 && CONFIRM.test(t) && b.closest('[class*=dialog],[class*=modal],[role=dialog]')) {
      const p = pending; pending = null; setTimeout(() => record(p.j, 'applied'), 300);
    }
  }, true);

  const chip = makeChip({ isJobPage: () => isDetail(), getJob: jobInfo, channel: CH });

  let checked = '';
  setInterval(() => {
    const p = location.pathname;
    if (checked === p || !isDetail()) return;
    checked = p;
    setTimeout(() => {
      const j = jobInfo();
      const lost = [!j.company && '公司', !j.role && '岗位'].filter(Boolean);
      if (lost.length) miss('读取职位页', `职位页上没认出：${lost.join('、')}`);
    }, 5000);
  }, 2000);
})();

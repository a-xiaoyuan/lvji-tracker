// 履迹助手 · 网申半自动填表
// 只做三件事：从本机履迹读「关于我」档案 → 把空字段填上 → 提示你核对。
// 绝不点提交按钮，绝不覆盖你已经填好的内容，档案只从本机 127.0.0.1 的履迹来。
(() => {
  if (window.__lvFillRunning) return;
  window.__lvFillRunning = true;
  const toast = msg => {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483647;background:#16161d;color:#fff;padding:10px 16px;border-radius:10px;border:2px solid #16161d;box-shadow:3px 3px 0 #ff2d87;font:600 13px "Microsoft YaHei UI",system-ui,sans-serif;max-width:88vw';
    (document.body || document.documentElement).appendChild(d);
    setTimeout(() => d.remove(), 4500);
  };
  const finish = () => { window.__lvFillRunning = false; };
  try {
    chrome.runtime.sendMessage({ type: 'profile' }, r => {
      if (!r || !r.ok) { toast('履迹助手：没拿到档案（' + ((r && r.why) || '履迹没开或还没连上') + '）'); return finish(); }
      const P = r.profile || {};
      if (!P.name && !P.phone && !P.school) { toast('履迹助手：档案还是空的，先去履迹「关于我」里把网申档案补全'); return finish(); }
      const labelOf = el => {
        const parts = [el.placeholder, el.name, el.getAttribute && el.getAttribute('aria-label')];
        try { if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) parts.unshift(l.innerText); } } catch {}
        const wrap = el.closest && el.closest('label,.form-item,.el-form-item,.field,.form-group,.ant-form-item');
        if (wrap && wrap.innerText) parts.unshift(wrap.innerText.slice(0, 60));
        return parts.filter(Boolean).join(' ');
      };
      let n = 0;
      document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]):not([type=button]),textarea,select').forEach(el => {
        if (el.disabled || el.readOnly) return;
        if (el.value && String(el.value).trim()) return; // 已经填了的不动
        const key = lvFieldFor(labelOf(el));
        if (!key) return;
        const v = P[key];
        if (!v) return;
        if (el.tagName === 'SELECT') {
          const opt = [...el.options].find(o => o.text && (o.text.includes(v) || v.includes(o.text)));
          if (!opt) return;
          el.value = opt.value;
        } else {
          const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
          if (setter && setter.set) setter.set.call(el, v); else el.value = v;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        n++;
      });
      toast(n ? `履迹助手：已填 ${n} 个字段，请逐项核对后再自己点提交` : '履迹助手：这个页面没认出可填的空字段');
      finish();
    });
  } catch (e) { toast('履迹助手：扩展已更新，请刷新这个页面再试'); finish(); }
})();

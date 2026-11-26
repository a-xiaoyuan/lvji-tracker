// 在本机履迹页面上运行：把履迹的访问密钥交给扩展（配对），之后扩展才能往履迹里记东西。
// 只在 http://127.0.0.1:47321/jobs/ 上运行，密钥只存在这个浏览器的扩展存储里。
(() => {
  const pair = () => {
    const t = localStorage.getItem('jt_token');
    if (t) chrome.runtime.sendMessage({ type: 'pair', token: t }).catch(() => {});
  };
  pair();
  setTimeout(pair, 3000); // 第一次从快捷方式打开时，页面要先把网址里的密钥存好
})();

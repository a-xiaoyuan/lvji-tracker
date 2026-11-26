// 从 JobTracker/js/*.js 里按名字取出顶层函数 / 常量，放进一个隔离的 vm 环境里运行。
// 这样测试的就是真正发布出去的代码。
// 约定（这些脚本的写法）：顶层定义从第 0 列开始，续行以空格开头。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(ROOT, 'JobTracker', 'js');
const LINES = fs.readdirSync(JS).filter(f => f.endsWith('.js')).sort()
  .flatMap(f => fs.readFileSync(path.join(JS, f), 'utf8').split(/\r?\n/));

export function source(name) {
  const re = new RegExp(String.raw`^(?:async\s+)?(?:function\s+` + name + String.raw`\s*\(|(?:const|let)\s+` + name + String.raw`\s*=)`);
  const i = LINES.findIndex(l => re.test(l));
  if (i < 0) throw new Error(`JobTracker/js 里找不到顶层定义：${name}`);
  const out = [LINES[i]];
  for (let j = i + 1; j < LINES.length && /^[ \t]/.test(LINES[j]); j++) out.push(LINES[j]);
  return out.join('\n');
}

// names 按依赖顺序给出；返回一个对象，里面是这些名字对应的值
export function load(names, globals = {}) {
  const ctx = vm.createContext({ console, URL, ...globals });
  const code = names.map(source).join('\n') + `\n;({${names.join(',')}})`;
  return vm.runInContext(code, ctx, { filename: 'JobTracker/js(extract)' });
}

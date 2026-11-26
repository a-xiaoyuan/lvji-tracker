# 履迹 · 本地优先的求职进度管理

履迹是一个跑在自己电脑上的求职看板：记录投递、面试日程、跟进提醒，自带 AI 面试教练和简历编辑器 [如页](https://github.com/a-xiaoyuan/ruye-resume)。
数据只存在本机，不需要注册账号，也没有服务器。

## 功能

- **投递看板**：想投 / 已投递 / 面试中 / Offer / 结束，拖动卡片改状态；每家公司有自己的档案。
- **面试日程**：粘贴 HR 的邀请消息，AI 自动识别时间、轮次、会议号，生成日程；两场安排撞时间会提醒。
- **跟进提醒**：投递后多久没回音、面试后多久该问结果，到点在首页提醒。
- **Boss直聘 自动记录（浏览器扩展）**：在网页版点「立即沟通」自动记为已投递；聊天里出现面试邀请时交给履迹建日程。
- **一键加到履迹（书签）**：在招聘网站的岗位页、列表页、聊天页点一下书签，就能把岗位收进来。
- **AI 助手**：模拟面试和复盘、按 JD 改简历、写沟通话术、找岗位。支持 DeepSeek API，或本机已登录的 Claude Code / Codex 命令行。
- **力扣同步**：填上力扣（leetcode.cn）用户名，首页显示刷题数、连续天数、每日一题。
- **如页简历编辑器**：Typst 排版，所见即所得导出 PDF。
- **自动备份**：数据存在「文档\求职进度」，每天自动备份。

## 安装（Windows）

需要 [Node.js](https://nodejs.org/zh-cn/download) 22 或更高版本（选 LTS）。

1. 下载这个仓库（绿色按钮 Code → Download ZIP），解压。
2. 双击 `打包\打包履迹.cmd`，桌面上会生成 `履迹-安装包-版本号.zip`。
3. 解压这个安装包，双击里面的「安装或更新.cmd」。
4. 桌面出现「履迹」和「如页」图标，双击打开。

更新时重复上面的步骤即可，数据和设置都会保留。

### 安装 Boss直聘 扩展（可选）

1. 履迹 → 设置 → 「Boss 自动记录」→「打开扩展文件夹」。
2. 浏览器打开 `edge://extensions`（Chrome 是 `chrome://extensions`），打开「开发人员模式」。
3. 点「加载解压缩的扩展」，选择 `extension` 文件夹。
4. 在同一个浏览器里打开一次履迹，扩展会自动配对。

扩展只读取你正在看的页面，不会替你点击、投递，也不会调用 Boss直聘 的接口。只对网页版有效。

## 目录结构

| 目录 | 内容 |
|---|---|
| `JobTracker/` | 履迹主程序（单个 HTML 文件）和书签弹窗 `add.html` |
| `helper/` | 本机小服务（Node.js，只监听 127.0.0.1:47321）：读写数据、备份、AI、力扣同步 |
| `extension/` | Boss直聘 浏览器扩展（Manifest V3） |
| `Ruye/` | 如页简历编辑器的构建产物，源码见 [ruye-resume](https://github.com/a-xiaoyuan/ruye-resume) |
| `打包/` | 生成安装包的脚本，以及安装 / 卸载脚本 |

## 隐私

- 所有数据都在你自己的电脑上，履迹不会把数据上传到任何地方。
- 用 AI 功能时，相关内容会发给你自己配置的 AI 服务（DeepSeek 或本机的 Claude Code / Codex）。
- 本机服务用随机生成的访问密钥保护，只接受来自本机的请求。

## 致谢与许可

- 本项目使用 [MIT 许可证](LICENSE)。
- `JobTracker/sakuga/`：MIT 许可，见该目录下的 LICENSE。
- `Ruye/fonts/`：思源黑体 / 思源宋体（Noto Sans SC / Noto Serif SC），SIL Open Font License，见 `Ruye/fonts/OFL.txt`。
- `Ruye/wasm/`：基于 [Typst](https://github.com/typst/typst)（Apache-2.0）。

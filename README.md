# 履迹 · 本地优先的求职进度管理

履迹是一个跑在自己电脑上的求职看板：记录投递、面试日程、跟进提醒，自带 AI 面试教练和简历编辑器 [如页](https://github.com/a-xiaoyuan/ruye-resume)。
数据只存在本机，不需要注册账号，也没有服务器。

## 功能

- **投递看板**：想投 / 已投递 / 面试中 / Offer / 结束，拖动卡片改状态；列宽随窗口自适应，空列和已结束的列自动收成窄条，一屏看全；每家公司有自己的档案。
- **面试日程**：粘贴 HR 的邀请消息，AI 自动识别时间、轮次、会议号，生成日程；两场安排撞时间会提醒。
- **跟进提醒**：投递后多久没回音、面试后多久该问结果，到点在首页提醒。
- **投递自动记录（浏览器扩展）**：
  - Boss直聘：在网页版点「立即沟通」自动记为已投递；聊天里出现面试邀请时交给履迹建日程。
  - 牛客网：在职位页「立即申请」并确认后记为已投递；跳转公司官网网申的先记为待投递。
- **一键加到履迹（书签）**：在招聘网站的岗位页、列表页、聊天页点一下书签，就能把岗位收进来。
- **AI 助手**：模拟面试和复盘、按 JD 改简历、写沟通话术、找岗位。支持 DeepSeek API，或本机已登录的 Claude Code / Codex 命令行。
- **力扣同步**：填上力扣（leetcode.cn）用户名，首页显示刷题数、连续天数、每日一题。
- **如页简历编辑器**：Typst 排版，所见即所得导出 PDF。
- **自动备份**：数据存在「文档\求职进度」，每天自动备份。

## 安装（Windows）

需要 [Node.js](https://nodejs.org/zh-cn/download)（选 LTS）。没装的话，安装程序会提示用 Windows 自带的 winget 自动装好。

1. 到右侧 **Releases** 下载最新的 `履迹-安装包-版本号.zip`。
   （没有 Releases 时：下载这个仓库，绿色按钮 Code → Download ZIP，解压后双击 `打包\打包履迹.cmd`，桌面上会生成安装包。）
2. 解压这个安装包，双击里面的「安装或更新.cmd」。
3. 桌面出现「履迹」和「如页」图标，双击打开。

更新时重复上面的步骤即可，数据和设置都会保留。

### 安装投递自动记录扩展（可选，支持 Boss直聘、牛客网）

1. 履迹 → 设置 → 「投递自动记录」→「打开扩展文件夹」。
2. 浏览器打开 `edge://extensions`（Chrome 是 `chrome://extensions`），打开「开发人员模式」。
3. 点「加载解压缩的扩展」，选择 `extension` 文件夹。
4. 在同一个浏览器里打开一次履迹，扩展会自动配对。

扩展只读取你正在看的页面，不会替你点击、投递，也不会调用招聘网站的接口。只对网页版有效。

## 目录结构

| 目录 | 内容 |
|---|---|
| `JobTracker/` | 履迹主程序：`index.html` + `app.css` + `js/`（按功能分的 12 个脚本，按顺序加载）和书签弹窗 `add.html` |
| `helper/` | 本机小服务（Node.js，只监听 127.0.0.1:47321）：读写数据、备份、AI、力扣同步 |
| `extension/` | 投递自动记录浏览器扩展（Manifest V3），支持 Boss直聘、牛客网 |
| `Ruye/` | 如页简历编辑器（**不在仓库里**）：发布时从 [ruye-resume](https://github.com/a-xiaoyuan/ruye-resume) 源码编译；本地开发运行 `打包/get-ruye.ps1` 获取 |
| `打包/` | 生成安装包的脚本，以及安装 / 卸载脚本 |

## 隐私

- 所有数据都在你自己的电脑上，履迹不会把数据上传到任何地方。
- 用 AI 功能时，相关内容会发给你自己配置的 AI 服务（DeepSeek 或本机的 Claude Code / Codex）。
- 本机服务用随机生成的访问密钥保护，只接受来自本机的请求。
- 开着两个履迹窗口时，保存会先比对版本：文件被另一个窗口改过就自动合并两边的修改，不会整份覆盖。

## 开发

```bash
npm test   # 不需要安装任何依赖，Node.js 22+ 自带测试工具
```

```powershell
powershell -File 打包/get-ruye.ps1          # 从最新 Release 取如页（打安装包前需要）
powershell -File 打包/get-ruye.ps1 -Build   # 或者从源码编译（要 git、pnpm）
```

- `tests/core.test.mjs`：直接从 `JobTracker/js/` 里取出核心函数来测（数据修复、多窗口合并、批量导入解析、AI 返回解析、面试邀请识别、公司查重、链接过滤）。
- `tests/server.test.mjs`：在临时目录和临时端口上启动本机服务，测密钥校验、保存防覆盖、并发保存、路径穿越、收件箱、Agent 开关。不会碰真实数据。
- `tests/extension.test.mjs`：浏览器扩展后台脚本的去重、失败自检记录、断线后能重记。
- 每次推送都会在 GitHub Actions 上（Windows 和 Linux）自动跑测试；推送 `v` 开头的标签（如 `v2026.11.26`）会自动打安装包并发布到 Releases。

## 致谢与许可

- 本项目使用 [MIT 许可证](LICENSE)。
- `JobTracker/sakuga/`：MIT 许可，见该目录下的 LICENSE。
- 如页（安装包里的 `Ruye/`）：字体为思源黑体 / 思源宋体（Noto Sans SC / Noto Serif SC），SIL Open Font License，见 `Ruye/fonts/OFL.txt`；排版引擎基于 [Typst](https://github.com/typst/typst)（Apache-2.0）。

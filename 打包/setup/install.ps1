# 履迹 安装 / 更新
# 第一次运行：安装到 %LOCALAPPDATA%\Lvji，生成访问密钥，建桌面快捷方式
# 以后再运行新版本：覆盖程序文件，访问密钥和所有数据都保留，旧版本备份到 _旧版本
$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = '履迹 安装 / 更新'
$Pkg = Split-Path -Parent $PSScriptRoot                 # 解压出来的安装包根目录
$Src = Join-Path $Pkg 'app'
$Dst = Join-Path $env:LOCALAPPDATA 'Lvji'
$Ver = (Get-Content (Join-Path $Src 'VERSION') -Raw).Trim()

function Say($t, $c = 'Gray') { Write-Host $t -ForegroundColor $c }
function Fail($t) { Say "`n✗ $t" Red; Read-Host "`n按回车关闭"; exit 1 }

Say "履迹 $Ver" Magenta
Say "────────────────────────────"

# 1. Node.js（后台助手要用）
$node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if (-not $node) {
  foreach ($p in @("$env:ProgramFiles\nodejs\node.exe", "${env:ProgramFiles(x86)}\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe")) { if (Test-Path $p) { $node = $p; break } }
}
if (-not $node) {
  Say "还没有安装 Node.js（履迹的后台助手需要它，免费）。" Yellow
  Say "马上帮你打开下载页：选「LTS 长期支持版」的 Windows 安装包，一路下一步装好，再双击一次「安装或更新」。" Yellow
  Start-Process 'https://nodejs.org/zh-cn/download'
  Fail '请先安装 Node.js'
}
$nv = (& $node -v).TrimStart('v'); if ([int]($nv.Split('.')[0]) -lt 18) { Fail "Node.js 版本太旧（$nv），需要 18 或更新的版本：https://nodejs.org/zh-cn/download" }
Say "✓ Node.js $nv" Green

# 2. 已经装过：先停掉正在运行的助手，备份旧版本
$old = ''
if (Test-Path (Join-Path $Dst 'VERSION')) { $old = (Get-Content (Join-Path $Dst 'VERSION') -Raw).Trim() }
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*$Dst\helper\server.mjs*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
if ($old) {
  $bak = Join-Path $Dst ("_旧版本\$old")
  if (-not (Test-Path $bak)) {
    New-Item -ItemType Directory -Force $bak | Out-Null
    foreach ($d in 'JobTracker', 'helper') { if (Test-Path "$Dst\$d") { Copy-Item "$Dst\$d" $bak -Recurse -Force } }
    Copy-Item "$Dst\VERSION" $bak -Force
  }
  # 只留最近 3 个旧版本
  Get-ChildItem (Join-Path $Dst '_旧版本') -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3 | Remove-Item -Recurse -Force
  Say "✓ 正在从 $old 更新到 $Ver（旧版本已备份）" Green
}

# 3. 复制程序文件（访问密钥 token.txt、DeepSeek 密钥不在安装包里，原有的会保留）
New-Item -ItemType Directory -Force $Dst | Out-Null
foreach ($d in 'JobTracker', 'Ruye', 'helper', 'extension') {
  $rc = robocopy (Join-Path $Src $d) (Join-Path $Dst $d) /MIR /XF token.txt deepseek-key.txt agent-usage.json /XD node_modules /NFL /NDL /NJH /NJS /NP
  if ($LASTEXITCODE -ge 8) { Fail "复制 $d 失败（robocopy 返回 $LASTEXITCODE）" }
}
Copy-Item (Join-Path $Src 'VERSION') $Dst -Force
Copy-Item (Join-Path $PSScriptRoot 'uninstall.ps1') $Dst -Force
Get-ChildItem $Dst -Recurse -File | Unblock-File -ErrorAction SilentlyContinue
Say "✓ 程序文件已就位：$Dst" Green

# 4. 访问密钥：每台电脑自己生成一个，只有本机的履迹页面知道
$tok = Join-Path $Dst 'helper\token.txt'
if (-not (Test-Path $tok)) {
  $b = New-Object byte[] 24; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  [IO.File]::WriteAllText($tok, (($b | ForEach-Object { $_.ToString('x2') }) -join ''))
  Say "✓ 已生成本机访问密钥" Green
}

# 5. 启动脚本：写入本机的 Node.js 和 Edge 路径
$edge = ''
foreach ($p in @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")) { if (Test-Path $p) { $edge = $p; break } }
$vbs = (Get-Content (Join-Path $PSScriptRoot 'launch.vbs') -Raw -Encoding UTF8).Replace('__NODE__', $node).Replace('__EDGE__', $edge)
[IO.File]::WriteAllText((Join-Path $Dst 'helper\launch.vbs'), $vbs, [Text.Encoding]::Unicode)

# 6. 快捷方式：桌面 + 开始菜单
$sh = New-Object -ComObject WScript.Shell
$desk = [Environment]::GetFolderPath('Desktop'); $menu = Join-Path ([Environment]::GetFolderPath('Programs')) '履迹'
if ($env:LVJI_TEST_LINKS) { $desk = $env:LVJI_TEST_LINKS; $menu = Join-Path $env:LVJI_TEST_LINKS 'menu' }  # 只在测试时用
New-Item -ItemType Directory -Force $menu | Out-Null
function Link($dir, $name, $arg, $icon, $desc) {
  $l = $sh.CreateShortcut((Join-Path $dir "$name.lnk"))
  $l.TargetPath = "$env:WINDIR\System32\wscript.exe"; $l.Arguments = "`"$Dst\helper\launch.vbs`" $arg"
  $l.WorkingDirectory = "$Dst\helper"; $l.IconLocation = $icon; $l.Description = $desc; $l.Save()
}
foreach ($dir in $desk, $menu) {
  Link $dir '履迹' 'jobs' "$Dst\JobTracker\icon.ico" '履迹：求职进度管理'
  Link $dir '如页' 'ruye' "$Dst\Ruye\app.ico" '如页：简历编辑'
}
$u = $sh.CreateShortcut((Join-Path $menu '卸载履迹.lnk'))
$u.TargetPath = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"; $u.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$Dst\uninstall.ps1`""; $u.Save()
Say "✓ 已在桌面和开始菜单建好「履迹」「如页」快捷方式" Green

Say "────────────────────────────"
if ($old) { Say "更新完成！投递记录、简历和设置都还在。" Magenta } else {
  Say "安装完成！" Magenta
  Say "· 数据保存在「文档\求职进度」，每天自动备份" Gray
  Say "· AI 功能（模拟面试、写话术等）要在 设置 → AI 助手 里配置，不配也能正常使用其他功能" Gray
}
if ($env:LVJI_NO_LAUNCH -ne '1') { Start-Process "$env:WINDIR\System32\wscript.exe" -ArgumentList "`"$Dst\helper\launch.vbs`" jobs" }
Start-Sleep -Seconds 3

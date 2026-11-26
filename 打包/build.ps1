# 打包履迹：把当前正在用的版本做成可以发给别人的安装包（桌面上的 zip）
# 不会打包：访问密钥、DeepSeek 密钥、你的数据（文档\求职进度）、Agent 用量记录
$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = '打包履迹'
$Apps = Split-Path -Parent $PSScriptRoot
$Setup = Join-Path $PSScriptRoot 'setup'
$Ver = Get-Date -Format 'yyyy.MM.dd.HHmm'
$Name = "履迹-安装包-$Ver"
$Root = Join-Path $env:TEMP 'lvji-build'
$Stage = Join-Path $Root $Name
$Zip = Join-Path ([Environment]::GetFolderPath('Desktop')) "$Name.zip"
$utf8 = New-Object Text.UTF8Encoding $false
$utf8bom = New-Object Text.UTF8Encoding $true
function Say($t, $c = 'Gray') { Write-Host $t -ForegroundColor $c }
function Fail($t) { Say "`n✗ $t" Red; if (Test-Path $Root) { Remove-Item $Root -Recurse -Force }; Read-Host "`n按回车关闭"; exit 1 }

Say "打包履迹 $Ver" Magenta
if (Test-Path $Root) { Remove-Item $Root -Recurse -Force }
New-Item -ItemType Directory -Force "$Stage\app", "$Stage\setup" | Out-Null

# 1. 程序文件
$skip = @('token.txt', 'deepseek-key.txt', 'agent-usage.json', 'migrated.txt', 'digest-sent.txt', 'agent-on.txt', 'launch.vbs', '*.log', '*.bak', '*.tmp')
foreach ($d in 'JobTracker', 'Ruye', 'helper', 'extension') {
  $null = robocopy (Join-Path $Apps $d) "$Stage\app\$d" /MIR /XF $skip /XD node_modules .git /NFL /NDL /NJH /NJS /NP
  if ($LASTEXITCODE -ge 8) { Fail "复制 $d 失败" }
}
[IO.File]::WriteAllText("$Stage\app\VERSION", $Ver, $utf8)
# 版本号写进页面，设置 → 关于履迹 里显示
$idx = "$Stage\app\JobTracker\index.html"
$h = [IO.File]::ReadAllText($idx, $utf8)
$h = $h -replace '<meta name="lvji-version"[^>]*>', ''
$i = $h.IndexOf('<head>'); if ($i -lt 0) { Fail '页面里找不到 <head>' }
$h = $h.Insert($i + 6, "<meta name=`"lvji-version`" content=`"$Ver`">")
[IO.File]::WriteAllText($idx, $h, $utf8)
Say "✓ 程序文件" Green

# 2. 安装脚本（.ps1 要带 BOM，Windows PowerShell 才能正确读中文）
foreach ($f in 'install.ps1', 'uninstall.ps1') { [IO.File]::WriteAllText("$Stage\setup\$f", [IO.File]::ReadAllText("$Setup\$f", $utf8), $utf8bom) }
Copy-Item "$Setup\launch.vbs" "$Stage\setup\"
foreach ($f in '安装或更新.cmd', '卸载.cmd', '使用说明.txt') { Copy-Item "$Setup\$f" $Stage }
Say "✓ 安装脚本" Green

# 3. 隐私检查：安装包里不能出现你的密钥、个人信息和本机路径
$needles = @{}
$tf = Join-Path $Apps 'helper\token.txt'; if (Test-Path $tf) { $needles['访问密钥'] = (Get-Content $tf -Raw).Trim() }
$k = [Environment]::GetEnvironmentVariable('DEEPSEEK_API_KEY', 'User'); if ($k) { $needles['DeepSeek 密钥'] = $k }
$kf = Join-Path $Apps 'helper\deepseek-key.txt'; if (Test-Path $kf) { $needles['DeepSeek 密钥（文件）'] = (Get-Content $kf -Raw).Trim() }
$needles['本机用户路径'] = "Users\$env:USERNAME\"
$needles['本机用户路径 '] = "Users/$env:USERNAME/"
try {
  $data = Get-Content (Join-Path ([Environment]::GetFolderPath('MyDocuments')) '求职进度\jobtracker-data.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $p = $data.data.settings.profile
  if ($p.name -and $p.name.Length -ge 2) { $needles['你的名字'] = $p.name }
  if ($data.data.settings.lcUser) { $needles['力扣用户名'] = $data.data.settings.lcUser }
} catch {}
$git = (git config --global user.email 2>$null); if ($git) { $needles['邮箱'] = $git.Trim() }
$hits = @()
Get-ChildItem "$Stage" -Recurse -File -Include *.html, *.js, *.mjs, *.json, *.ps1, *.vbs, *.txt, *.css, *.cmd, *.md | ForEach-Object {
  $t = [IO.File]::ReadAllText($_.FullName)
  foreach ($n in $needles.GetEnumerator()) { if ($n.Value -and $n.Value.Length -ge 3 -and $t.Contains($n.Value)) { $hits += "$($n.Key)：$($_.FullName.Substring($Stage.Length + 1))" } }
}
if ($hits) { Say "发现不该打包的内容：" Red; $hits | ForEach-Object { Say "  · $_" Red }; Fail '已停止打包，什么都没生成' }
Say "✓ 隐私检查通过（检查了 $($needles.Count) 项）" Green

# 4. 压缩（文件名用 UTF-8，资源管理器解压中文名不会乱码）
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $Zip) { Remove-Item $Zip -Force }
Add-Type -AssemblyName System.IO.Compression
# 逐个写入：路径统一用 /，中文文件名按 UTF-8 标记（.NET 自带的 CreateFromDirectory 会写成反斜杠）
$fs = [IO.File]::Open($Zip, 'Create')
$za = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create, $false, [Text.Encoding]::UTF8)
try {
  Get-ChildItem $Root -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
    $e = $za.CreateEntry($rel, [IO.Compression.CompressionLevel]::Optimal); $e.LastWriteTime = $_.LastWriteTime
    $w = $e.Open(); $r = [IO.File]::OpenRead($_.FullName); $r.CopyTo($w); $r.Dispose(); $w.Dispose()
  }
} finally { $za.Dispose(); $fs.Dispose() }
Remove-Item $Root -Recurse -Force
$mb = [math]::Round((Get-Item $Zip).Length / 1MB, 1)
Say "`n✓ 打包完成：$Zip（$mb MB）" Magenta
Say "把这个 zip 发给对方，让他解压后双击「安装或更新.cmd」。以后更新也一样。" Gray
if ($env:LVJI_NO_PAUSE -ne '1') { Start-Process explorer.exe "/select,`"$Zip`""; Read-Host "`n按回车关闭" }

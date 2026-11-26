# 取如页（简历编辑器）的构建产物，放到仓库的 Ruye\ 目录。仓库里不再保存这 35MB 的编译结果。
#
#   powershell -File 打包\get-ruye.ps1          从履迹最新的 Release 安装包里取（只要网络）
#   powershell -File 打包\get-ruye.ps1 -Build   从 ruye-resume 源码编译（要 git、Node 22、pnpm；有 Python 时字体更小）
#
# 发布时 GitHub Actions 用的是 -Build 的同一套步骤（见 .github/workflows/release.yml）。
param([switch]$Build, [string]$Ref = 'main')
$ErrorActionPreference = 'Stop'
$Repo = Split-Path -Parent $PSScriptRoot
$Out = Join-Path $Repo 'Ruye'
$Tmp = Join-Path $env:TEMP 'lvji-get-ruye'
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }
New-Item -ItemType Directory -Force $Tmp | Out-Null

if ($Build) {
  git clone --depth 1 --branch $Ref https://github.com/a-xiaoyuan/ruye-resume.git "$Tmp\src"
  if ($LASTEXITCODE) { throw '下载如页源码失败' }
  Push-Location "$Tmp\src"
  try {
    pnpm install; if ($LASTEXITCODE) { throw 'pnpm install 失败' }
    python -m pip install --quiet fonttools 2>$null   # 没有 Python 也行，只是字体大一些
    pnpm fonts; if ($LASTEXITCODE) { throw '准备字体失败' }
    pnpm build; if ($LASTEXITCODE) { throw '编译失败' }
  } finally { Pop-Location }
  $dist = "$Tmp\src\apps\web\dist"
} else {
  $rel = Invoke-RestMethod 'https://api.github.com/repos/a-xiaoyuan/lvji-tracker/releases/latest' -Headers @{ 'User-Agent' = 'lvji-get-ruye' }
  $asset = $rel.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1
  if (-not $asset) { throw '最新的 Release 里没有安装包，改用 -Build 从源码编译' }
  Write-Host "下载 $($asset.name)（$([math]::Round($asset.size / 1MB, 1)) MB）"
  Invoke-WebRequest $asset.browser_download_url -OutFile "$Tmp\pkg.zip" -UseBasicParsing
  Expand-Archive "$Tmp\pkg.zip" "$Tmp\pkg"
  $dist = Get-ChildItem "$Tmp\pkg" -Recurse -Directory -Filter Ruye | Where-Object { Test-Path (Join-Path $_.FullName 'index.html') } | Select-Object -First 1 -ExpandProperty FullName
  if (-not $dist) { throw '安装包里找不到 Ruye 目录' }
}

$null = robocopy $dist $Out /MIR /XF app.ico ruye-avatar.ico /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) { throw '复制失败' }
foreach ($f in 'app.ico', 'ruye-avatar.ico') { if (-not (Test-Path "$Out\$f")) { Copy-Item "$PSScriptRoot\ruye-icon\$f" $Out } }
Remove-Item $Tmp -Recurse -Force
Write-Host "✓ 如页已放到 $Out" -ForegroundColor Green

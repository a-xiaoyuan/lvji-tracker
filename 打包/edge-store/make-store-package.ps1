# 生成提交 Edge 外接程序商店用的材料（放到桌面的「履迹助手-Edge商店-版本号」文件夹）：
#   · 履迹助手-<版本>.zip   上传到 Partner Center 的扩展包（manifest.json 在 zip 根目录）
#   · logo-300.png          商店图标（300×300）
#   · promo-440x280.png     小宣传图（可选）
#   · 商店资料.md           要填进表单的文字（介绍、权限说明、隐私政策、审核说明）
# 用的是仓库里的通用图标「履」，不会带上你自己换过的头像。
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Ext = Join-Path $Repo 'extension'
$utf8 = New-Object Text.UTF8Encoding $false
$man = Get-Content (Join-Path $Ext 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$Ver = $man.version
$Out = Join-Path ([Environment]::GetFolderPath('Desktop')) "履迹助手-Edge商店-$Ver"
$Stage = Join-Path $env:TEMP 'lvji-edge-store'
foreach ($d in $Out, $Stage) { if (Test-Path $d) { Remove-Item $d -Recurse -Force }; New-Item -ItemType Directory -Force $d | Out-Null }

function New-Badge([int]$w, [int]$h, [string]$glyph, [string]$caption) {
  $b = New-Object Drawing.Bitmap $w, $h
  $g = [Drawing.Graphics]::FromImage($b)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
  $s = [Math]::Min($w, $h)
  if ($caption) { $g.Clear([Drawing.ColorTranslator]::FromHtml('#16161d')) } else { $g.Clear([Drawing.Color]::Transparent) }
  $size = if ($caption) { [int]($s * 0.62) } else { $s }
  $x0 = if ($caption) { [int]($h * 0.19) } else { 0 }; $y0 = [int](($h - $size) / 2)
  $r = [int]($size * 0.22); $pad = [int]($size * 0.04); $off = [int]($size * 0.05); $bw = $size - 2 * $pad - $off
  function RR($x, $y, $ww) {
    $p = New-Object Drawing.Drawing2D.GraphicsPath
    $p.AddArc($x, $y, $r, $r, 180, 90); $p.AddArc($x + $ww - $r, $y, $r, $r, 270, 90)
    $p.AddArc($x + $ww - $r, $y + $ww - $r, $r, $r, 0, 90); $p.AddArc($x, $y + $ww - $r, $r, $r, 90, 90); $p.CloseFigure(); $p
  }
  $shadow = if ($caption) { '#000000' } else { '#16161d' }
  $g.FillPath((New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($shadow))), (RR ($x0 + $pad + $off) ($y0 + $pad + $off) $bw))
  $g.FillPath((New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#ff2d87'))), (RR ($x0 + $pad) ($y0 + $pad) $bw))
  $sf = New-Object Drawing.StringFormat; $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
  $f = New-Object Drawing.Font 'Microsoft YaHei UI', ([float]($bw * 0.52)), ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
  $g.DrawString($glyph, $f, [Drawing.Brushes]::White, (New-Object Drawing.RectangleF ($x0 + $pad), ($y0 + $pad + $bw * 0.03), $bw, $bw), $sf)
  if ($caption) {
    $tx = $x0 + $size + [int]($h * 0.1)
    $f1 = New-Object Drawing.Font 'Microsoft YaHei UI', ([float]($h * 0.15)), ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
    $f2 = New-Object Drawing.Font 'Microsoft YaHei UI', ([float]($h * 0.075)), ([Drawing.FontStyle]::Regular), ([Drawing.GraphicsUnit]::Pixel)
    $g.DrawString('履迹助手', $f1, [Drawing.Brushes]::White, [float]$tx, [float]($h * 0.3))
    $g.DrawString($caption, $f2, (New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml('#b8b8c8'))), [float]$tx, [float]($h * 0.53))
  }
  $g.Dispose(); $b
}
function Save-Png($bmp, $path) { $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose() }

# 1. 扩展包：程序文件 + 各尺寸图标，manifest 里写上 16/48/128
Get-ChildItem $Ext -File | Where-Object { $_.Name -ne 'icon.png' -and $_.Extension -in '.js', '.html', '.json', '.css' } | Copy-Item -Destination $Stage
foreach ($s in 16, 32, 48, 128) { Save-Png (New-Badge $s $s '履' '') "$Stage\icon-$s.png" }
$m = [IO.File]::ReadAllText("$Stage\manifest.json", $utf8)
$m = $m -replace '"icons":\s*\{[^}]*\}', '"icons": { "16": "icon-16.png", "32": "icon-32.png", "48": "icon-48.png", "128": "icon-128.png" }'
$m = $m -replace '"default_icon":\s*"icon\.png"', '"default_icon": { "16": "icon-16.png", "32": "icon-32.png" }'
if ($m -match 'icon\.png') { throw 'manifest 里还有 icon.png 没替换' }
[IO.File]::WriteAllText("$Stage\manifest.json", $m, $utf8)
$null = $m | ConvertFrom-Json   # 确认还是合法的 JSON
$zip = Join-Path $Out "履迹助手-$Ver.zip"
Compress-Archive -Path "$Stage\*" -DestinationPath $zip
Remove-Item $Stage -Recurse -Force

# 2. 商店图片和文字
Save-Png (New-Badge 300 300 '履' '') "$Out\logo-300.png"
Save-Png (New-Badge 440 280 '履' '投递自动记录') "$Out\promo-440x280.png"
Copy-Item (Join-Path $PSScriptRoot '商店资料.md') $Out

Write-Host "✓ 已生成：$Out" -ForegroundColor Green
if ($env:LVJI_NO_PAUSE -ne '1') { Start-Process explorer.exe "`"$Out`"" }

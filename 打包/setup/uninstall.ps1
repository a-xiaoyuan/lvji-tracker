# 卸载履迹：删掉程序和快捷方式，数据（文档\求职进度）默认保留
$Host.UI.RawUI.WindowTitle = '卸载履迹'
$Dst = Join-Path $env:LOCALAPPDATA 'Lvji'
Write-Host "这会删除履迹的程序文件和快捷方式。" -ForegroundColor Yellow
Write-Host "你的投递记录和简历在「文档\求职进度」，不会被删除。" -ForegroundColor Yellow
if ($env:LVJI_YES -ne '1' -and (Read-Host "确定卸载吗？输入 y 回车确认") -ne 'y') { exit }
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*$Dst\helper\server.mjs*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Milliseconds 500
$desk = [Environment]::GetFolderPath('Desktop'); $menu = Join-Path ([Environment]::GetFolderPath('Programs')) '履迹'
if ($env:LVJI_TEST_LINKS) { $desk = $env:LVJI_TEST_LINKS; $menu = Join-Path $env:LVJI_TEST_LINKS 'menu' }  # 只在测试时用
foreach ($n in '履迹', '如页') { Remove-Item (Join-Path $desk "$n.lnk") -ErrorAction SilentlyContinue }
Remove-Item $menu -Recurse -Force -ErrorAction SilentlyContinue
Set-Location $env:TEMP
Remove-Item $Dst -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`n已卸载。想彻底清除数据的话，手动删掉「文档\求职进度」文件夹。" -ForegroundColor Green
if ($env:LVJI_YES -ne '1') { Read-Host "按回车关闭" }

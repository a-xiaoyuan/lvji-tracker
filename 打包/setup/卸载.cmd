@echo off
chcp 65001 >nul
if exist "%LOCALAPPDATA%\Lvji\uninstall.ps1" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%LOCALAPPDATA%\Lvji\uninstall.ps1"
) else (
  echo 这台电脑上没有安装履迹。
  pause
)

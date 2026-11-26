@echo off
chcp 65001 >nul
if not exist "%~dp0setup\install.ps1" (
  echo.
  echo 请先把整个压缩包解压出来，再双击「安装或更新」。
  echo.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup\install.ps1"

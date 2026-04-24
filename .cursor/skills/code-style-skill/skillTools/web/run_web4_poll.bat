@echo off
setlocal
cd /d "%~dp0\..\.."
start "WEB-4 Poll" cmd /k node "skillTools\web\web4_terminal_auto_poll.mjs" --durationMs 0 --intervalMs 500
endlocal

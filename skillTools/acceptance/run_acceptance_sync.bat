@echo off
setlocal
cd /d "%~dp0\..\.."
start "Acceptance Sync" cmd /k node "skillTools\acceptance\sync_ai_acceptance.mjs" --intervalMs 1000
endlocal

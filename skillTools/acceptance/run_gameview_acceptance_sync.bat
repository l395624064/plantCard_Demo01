@echo off
setlocal
cd /d "%~dp0\..\.."
start "GameView Acceptance Sync" cmd /k node "skillTools\acceptance\sync_gameview_acceptance.mjs" --intervalMs 1000
endlocal

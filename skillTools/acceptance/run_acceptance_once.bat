@echo off
setlocal
cd /d "%~dp0\..\.."
node "skillTools\acceptance\sync_ai_acceptance.mjs" --once
endlocal

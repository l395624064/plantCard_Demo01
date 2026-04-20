@echo off
setlocal
cd /d "%~dp0\..\.."
node "skillTools\acceptance\sync_gameview_acceptance.mjs" --once
set "BOARD=skillTools\acceptance\GAMEVIEW_ACCEPTANCE_BOARD.md"
start "" "%BOARD%"
echo [GAMEVIEW_ACCEPTANCE] board opened: %BOARD%
echo [GAMEVIEW_ACCEPTANCE] preview shortcut: Ctrl+Shift+V (or Ctrl+K V)
endlocal

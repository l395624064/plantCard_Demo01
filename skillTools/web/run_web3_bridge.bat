@echo off
setlocal
cd /d "%~dp0\..\.."
node "skillTools\web\web3_browser_log_bridge.mjs"
endlocal

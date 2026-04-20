@echo off
setlocal

for /f "tokens=2 delims=," %%i in ('tasklist /fo csv /nh /fi "imagename eq node.exe"') do (
  wmic process where "ProcessId=%%~i and CommandLine like '%%sync_ai_acceptance.mjs%%'" get ProcessId /value 2>nul | find "=" >nul
  if not errorlevel 1 (
    taskkill /pid %%~i /f >nul 2>nul
    echo [ACCEPTANCE] stopped pid %%~i
  )
)

echo [ACCEPTANCE] stop check finished
endlocal

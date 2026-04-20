@echo off
setlocal

for /f "tokens=2 delims=," %%i in ('tasklist /fo csv /nh /fi "imagename eq node.exe"') do (
  wmic process where "ProcessId=%%~i and CommandLine like '%%web4_terminal_auto_poll.mjs%%'" get ProcessId /value 2>nul | find "=" >nul
  if not errorlevel 1 (
    taskkill /pid %%~i /f >nul 2>nul
    echo [WEB-4] stopped pid %%~i
  )
)

echo [WEB-4] stop check finished
endlocal

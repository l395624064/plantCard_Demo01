@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "BUILD_DIR=%~dp0build\web-mobile"
set "RESOURCES_DIR=%BUILD_DIR%\assets\resources"
set "SERVER_TEMPLATE=%~dp0cloudbase-static-server.template.js"
set "BIN_FILES=cocos-js\assets\spine-17c81aa0.wasm,cocos-js\assets\spine.js.mem-dc937d48.bin,src\effect.bin"
set "PORT=8080"
set "PREVIEW_URL=https://my-gameserver-4gkm6efr1a71bbc1-1258142635.tcloudbaseapp.com/gameDemo/"
set "REMOTE_UPLOAD_DIR=gameDemo/"
set "CLOUDBASE_ENV_ID=my-gameserver-4gkm6efr1a71bbc1"
set "UPLOAD_RESOURCES=1"
set "UPLOAD_RESOURCES_LABEL=YES"

if /I "%~1"=="--skip-resources" (
    set "UPLOAD_RESOURCES=0"
    set "UPLOAD_RESOURCES_LABEL=NO"
) else if /I "%~1"=="--with-resources" (
    set "UPLOAD_RESOURCES=1"
    set "UPLOAD_RESOURCES_LABEL=YES"
) else if not "%~1"=="" (
    echo [WARN] Unknown argument: %~1
    echo [WARN] Supported arguments:
    echo [WARN]   --with-resources  ^(default^)
    echo [WARN]   --skip-resources
)

echo [INFO] Build directory: %BUILD_DIR%
echo [INFO] Upload assets/resources/*: %UPLOAD_RESOURCES_LABEL%

if not exist "%BUILD_DIR%" (
    echo [ERROR] Build directory not found: %BUILD_DIR%
    echo [ERROR] Please build web-mobile in Cocos Creator first.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found.
    pause
    exit /b 1
)

where tcb >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] CloudBase CLI ^(tcb^) was not found.
    pause
    exit /b 1
)

if not exist "%BUILD_DIR%\index.html" (
    echo [ERROR] Missing %BUILD_DIR%\index.html
    pause
    exit /b 1
)

if not exist "%SERVER_TEMPLATE%" (
    echo [ERROR] Missing server template: %SERVER_TEMPLATE%
    pause
    exit /b 1
)

if "%UPLOAD_RESOURCES%"=="1" (
    if not exist "%RESOURCES_DIR%\config.json" (
        echo [ERROR] Missing %RESOURCES_DIR%\config.json
        pause
        exit /b 1
    )
    if not exist "%RESOURCES_DIR%\index.js" (
        echo [ERROR] Missing %RESOURCES_DIR%\index.js
        pause
        exit /b 1
    )
)

echo [INFO] Encoding binary files to base64...
for %%F in (%BIN_FILES%) do (
    set "SRC_FILE=%BUILD_DIR%\%%F"
    set "DST_FILE=%BUILD_DIR%\%%F.b64.txt"
    if exist "!SRC_FILE!" (
        echo [INFO]   Encoding: %%F
        powershell -NoProfile -Command ^
            "$bytes = [IO.File]::ReadAllBytes('!SRC_FILE!'); $text = [Convert]::ToBase64String($bytes); [IO.File]::WriteAllText('!DST_FILE!', $text, [Text.Encoding]::ASCII)"
        if !errorlevel! neq 0 (
            echo [WARN]   Encoding failed: %%F
        )
    ) else (
        echo [WARN]   File missing, skipped: !SRC_FILE!
    )
)

echo [INFO] Generating server.js...
copy /Y "%SERVER_TEMPLATE%" "%BUILD_DIR%\server.js" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate server.js
    pause
    exit /b 1
)
echo [INFO] server.js generated

set "SETTINGS_FILE=%BUILD_DIR%\src\settings.json"
if exist "%SETTINGS_FILE%" (
    powershell -NoProfile -Command ^
        "$c = Get-Content '%SETTINGS_FILE%' -Raw; if ($c -match 'effect\.bin[^.t]') { $c = $c -replace '\"effectSettingsPath\":\"src/effect\.bin\"','\"effectSettingsPath\":\"src/effect.bin\"'; $c | Set-Content '%SETTINGS_FILE%' -Encoding UTF8 -NoNewline }"
    echo [INFO] settings.json checked
)

echo.
echo ============================================================
echo [INFO] Upload target: CloudBase hosting path %REMOTE_UPLOAD_DIR%
echo [INFO] CloudBase env: %CLOUDBASE_ENV_ID%
echo [INFO] Preview URL: %PREVIEW_URL%
echo ============================================================
echo.
echo [INFO] Running local server check...
cd /d "%BUILD_DIR%"
set "SERVER_PID="
for /f %%i in ('powershell -NoProfile -Command "$p = Start-Process cmd.exe -ArgumentList '/c node \"%BUILD_DIR%\\server.js\" ^< nul ^> nul 2^>^&1' -WorkingDirectory '%BUILD_DIR%' -PassThru -WindowStyle Hidden; $p.Id"') do set "SERVER_PID=%%i"
timeout /t 2 /nobreak >nul
set "HTTP_STATUS=0"
for /f %%i in ('powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:%PORT%/').StatusCode } catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 } }"') do set "HTTP_STATUS=%%i"
if defined SERVER_PID (
    powershell -NoProfile -Command "Stop-Process -Id !SERVER_PID! -Force -ErrorAction SilentlyContinue"
)

if "%HTTP_STATUS%"=="200" (
    echo [OK] Local check passed with HTTP 200
) else (
    echo [WARN] Local check returned: %HTTP_STATUS%
    pause
    exit /b 1
)

echo.
echo [INFO] Deploying build/web-mobile to CloudBase hosting...
tcb hosting deploy "%BUILD_DIR%" "gameDemo" -e %CLOUDBASE_ENV_ID%
if %errorlevel% neq 0 (
    echo [ERROR] CloudBase hosting deploy failed
    pause
    exit /b 1
)
echo [OK] CloudBase hosting deploy completed
echo [INFO] Opening preview URL...
start "" "%PREVIEW_URL%"

echo.
echo [DONE] deploy-to-cloudstudio.bat finished.
pause
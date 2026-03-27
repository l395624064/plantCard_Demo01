@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

:: ============================================================
:: 配置区域 - 按需修改
:: ============================================================
:: 构建输出目录（相对于脚本所在目录，或使用绝对路径）
set BUILD_DIR=%~dp0build\web-mobile

:: 需要 base64 编码处理的二进制文件列表
:: 格式: 相对于 BUILD_DIR 的路径，用逗号分隔
:: 这些文件因扩展名限制无法直接上传，会被转为 .b64.txt
set BIN_FILES=cocos-js\assets\spine-17c81aa0.wasm,cocos-js\assets\spine.js.mem-dc937d48.bin,src\effect.bin

:: 服务器监听端口
set PORT=8080
set PREVIEW_URL=http://5ed886311638440282d2323ab9766d3e.ap-singapore.myide.io

:: ============================================================
:: 脚本主体
:: ============================================================
echo [INFO] 构建目录: %BUILD_DIR%

:: 检查构建目录是否存在
if not exist "%BUILD_DIR%" (
    echo [ERROR] 构建目录不存在: %BUILD_DIR%
    echo         请先在 Cocos Creator 中执行 构建 -^> web-mobile
    pause
    exit /b 1
)

:: 检查 Node.js 是否可用
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查 index.html 是否存在
if not exist "%BUILD_DIR%\index.html" (
    echo [ERROR] %BUILD_DIR%\index.html 不存在，请确认构建已完成
    pause
    exit /b 1
)

echo [INFO] 正在生成二进制文件的 base64 编码...

:: 对每个二进制文件生成 .b64.txt
for %%F in (%BIN_FILES%) do (
    set "SRC_FILE=%BUILD_DIR%\%%F"
    set "DST_FILE=%BUILD_DIR%\%%F.b64.txt"
    if exist "!SRC_FILE!" (
        echo [INFO]   编码: %%F
        powershell -NoProfile -Command ^
            "[Convert]::ToBase64String([IO.File]::ReadAllBytes('!SRC_FILE!')) | Set-Content '!DST_FILE!' -NoNewline -Encoding ASCII"
        if !errorlevel! neq 0 (
            echo [WARN]   编码失败: %%F （将跳过）
        )
    ) else (
        echo [WARN]   文件不存在，跳过: !SRC_FILE!
    )
)

:: 生成 server.js 到构建目录
echo [INFO] 正在生成 server.js...
(
echo const http = require^('http'^);
echo const fs = require^('fs'^);
echo const path = require^('path'^);
echo.
echo const MIME = {
echo   '.html': 'text/html',
echo   '.js': 'application/javascript',
echo   '.json': 'application/json',
echo   '.css': 'text/css',
echo   '.png': 'image/png',
echo   '.jpg': 'image/jpeg',
echo   '.gif': 'image/gif',
echo   '.svg': 'image/svg+xml',
echo   '.wasm': 'application/wasm',
echo   '.bin': 'application/octet-stream',
echo   '.txt': 'text/plain',
echo   '.mp3': 'audio/mpeg',
echo   '.ogg': 'audio/ogg',
echo   '.mp4': 'video/mp4',
echo   '.webm': 'video/webm',
echo   '.ico': 'image/x-icon',
echo };
echo.
echo // .bin / .wasm 等无法直接上传的文件，以 .b64.txt 形式存储，服务端解码后提供
echo const BINARY_ROUTES = {};
echo const B64_EXTS = ['.wasm', '.bin'];
echo function scanB64^(dir, base^) {
echo   const entries = fs.readdirSync^(dir, { withFileTypes: true }^);
echo   for ^(const e of entries^) {
echo     if ^(e.isDirectory^(^)^) { scanB64^(path.join^(dir, e.name^), base + '/' + e.name^); continue; }
echo     if ^(e.name.endsWith^('.b64.txt'^)^) {
echo       const origName = e.name.slice^(0, -8^); // remove .b64.txt
echo       const ext = path.extname^(origName^).toLowerCase^(^);
echo       if ^(B64_EXTS.includes^(ext^)^) {
echo         const route = base + '/' + origName;
echo         const mime = MIME[ext] ^|^| 'application/octet-stream';
echo         BINARY_ROUTES[route] = { file: path.join^(dir, e.name^), mime };
echo       }
echo     }
echo   }
echo }
echo scanB64^(__dirname, ''^);
echo.
echo http.createServer^(^(req, res^) =^> {
echo   const url = req.url.split^('?'^)[0];
echo   if ^(BINARY_ROUTES[url]^) {
echo     const { file, mime } = BINARY_ROUTES[url];
echo     fs.readFile^(file, 'utf8', ^(err, data^) =^> {
echo       if ^(err^) { res.writeHead^(404^); res.end^('Not Found'^); return; }
echo       const buf = Buffer.from^(data.trim^(^), 'base64'^);
echo       res.writeHead^(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*', 'Content-Length': buf.length }^);
echo       res.end^(buf^);
echo     }^);
echo     return;
echo   }
echo   let fp = path.join^(__dirname, url === '/' ? 'index.html' : url^);
echo   fs.stat^(fp, ^(err, stat^) =^> {
echo     if ^(err ^|^| stat.isFile^(^)^ === false^) { res.writeHead^(404^); res.end^('Not Found'^); return; }
echo     const mime = MIME[path.extname^(fp^).toLowerCase^(^)] ^|^| 'application/octet-stream';
echo     res.writeHead^(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' }^);
echo     fs.createReadStream^(fp^).pipe^(res^);
echo   }^);
echo }^).listen^(%PORT%, ^(^) =^> console.log^('Server running on port %PORT%'^)^);
) > "%BUILD_DIR%\server.js"

echo [INFO] server.js 已生成

:: 更新 settings.json 中的 effectSettingsPath（如果存在）
set "SETTINGS_FILE=%BUILD_DIR%\src\settings.json"
if exist "%SETTINGS_FILE%" (
    powershell -NoProfile -Command ^
        "$c = Get-Content '%SETTINGS_FILE%' -Raw; if ($c -match 'effect\.bin[^.t]') { $c = $c -replace '\"effectSettingsPath\":\"src/effect\.bin\"','\"effectSettingsPath\":\"src/effect.bin\"'; $c | Set-Content '%SETTINGS_FILE%' -Encoding UTF8 -NoNewline }"
    echo [INFO] settings.json 检查完毕
)

echo.
echo ============================================================
echo [INFO] Build output: %BUILD_DIR%
echo [INFO] Upload all files in this directory to CloudStudio.
echo [INFO] Then run: node server.js
echo [INFO] Server port: %PORT%
echo [INFO] Preview URL: %PREVIEW_URL%
echo ============================================================
echo.
echo [INFO] Running local server check...
cd /d "%BUILD_DIR%"
set "SERVER_PID="
for /f %%i in ('powershell -NoProfile -Command "$p = Start-Process node -ArgumentList 'server.js' -WorkingDirectory '%BUILD_DIR%' -PassThru -WindowStyle Hidden; $p.Id"') do set SERVER_PID=%%i
timeout /t 2 /nobreak >nul
set "HTTP_STATUS=0"
for /f %%i in ('powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:%PORT%/').StatusCode } catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 } }"') do set HTTP_STATUS=%%i
if defined SERVER_PID (
    powershell -NoProfile -Command "Stop-Process -Id !SERVER_PID! -Force -ErrorAction SilentlyContinue"
)

if "%HTTP_STATUS%"=="200" (
    echo [OK] Local check passed with HTTP 200
    echo [INFO] Cloud Studio preview URL: %PREVIEW_URL%
) else (
    echo [WARN] Local check returned: %HTTP_STATUS%
)

echo.
echo [DONE] 脚本执行完毕。
pause

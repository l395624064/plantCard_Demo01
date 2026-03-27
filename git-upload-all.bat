@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

:: =========================
:: 可配置项
:: =========================
set "REMOTE_URL=https://github.com/1395624064/MyPlant.git"
set "DEFAULT_BRANCH=master"

cd /d "%~dp0"
echo [INFO] 工作目录: %cd%

:: 1) 检查 Git
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未检测到 Git，请先安装 Git for Windows。
  echo         下载: https://git-scm.com/download/win
  pause
  exit /b 1
)

for /f "delims=" %%v in ('git --version') do set "GIT_VER=%%v"
echo [INFO] %GIT_VER%

:: 2) 可选升级 Git（需要 winget）
set /p UPGRADE_GIT="是否尝试升级 Git? (y/N): "
if /i "!UPGRADE_GIT!"=="y" (
  where winget >nul 2>&1
  if errorlevel 1 (
    echo [WARN] 未检测到 winget，跳过自动升级。
  ) else (
    echo [INFO] 正在升级 Git...
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    echo [INFO] 升级命令已执行，建议关闭并重新打开终端后再推送。
  )
)

:: 3) 初始化仓库（若尚未初始化）
if not exist ".git" (
  echo [INFO] 当前目录不是 Git 仓库，正在初始化...
  git init
  if errorlevel 1 goto :fail
)

:: 4) 获取当前分支
set "BRANCH="
for /f "delims=" %%b in ('git symbolic-ref --short HEAD 2^>nul') do set "BRANCH=%%b"
if "%BRANCH%"=="" set "BRANCH=%DEFAULT_BRANCH%"

:: 5) 录入提交信息
set "MSG="
set /p MSG="请输入提交信息(默认: update): "
if "%MSG%"=="" set "MSG=update"

:: 6) 暂存并提交
git add -A
if errorlevel 1 goto :fail

git diff --cached --quiet
if not errorlevel 1 (
  echo [INFO] 没有可提交的变更，跳过 commit。
  goto :push
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo [WARN] commit 失败，可能是未配置用户名/邮箱。
  echo [INFO] 你可先执行：
  echo        git config --global user.name "你的名字"
  echo        git config --global user.email "你的邮箱"
  goto :end
)

:push
:: 7) 配置远程仓库
set "HAS_ORIGIN="
for /f "delims=" %%r in ('git remote') do (
  if /i "%%r"=="origin" set "HAS_ORIGIN=1"
)

if "%HAS_ORIGIN%"=="" (
  echo [INFO] 正在添加远程 origin...
  git remote add origin "%REMOTE_URL%"
) else (
  echo [INFO] origin 已存在，更新为: %REMOTE_URL%
  git remote set-url origin "%REMOTE_URL%"
)
if errorlevel 1 goto :fail

:: 8) 推送（单次 SSL 兼容参数，不改全局配置）
echo [INFO] 正在推送到 origin/%BRANCH% ...
git -c http.sslBackend=schannel -c http.schannelCheckRevoke=false push -u origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] 推送失败。
  echo [TIPS] 若提示认证失败，请使用 GitHub PAT（不是账号密码）。
  echo [TIPS] 若分支不存在，可先执行: git branch -M main
  goto :end
)

echo [OK] 上传完成！
goto :end

:fail
echo [ERROR] 执行失败，请检查上方日志。

:end
pause
exit /b 0

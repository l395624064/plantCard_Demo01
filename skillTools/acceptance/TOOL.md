# Acceptance Toolchain / 验收工具链

## Purpose / 作用

- EN: Keep a dual-track acceptance board synchronized during demo phase:
  - user updates `userAccepted`,
  - AI automatically updates `aiAccepted` from runtime evidence.
- 中文：在演示阶段保持双轨验收同步：
  - 用户手动更新 `userAccepted`，
  - AI 基于运行时证据自动更新 `aiAccepted`。

## Files / 文件

- `acceptance_state.json`
  - EN: machine-readable acceptance state source.
  - 中文：机器可读验收状态源。
- `ACCEPTANCE_BOARD.md`
  - EN: markdown board generated from state.
  - 中文：由状态文件生成的 Markdown 看板。
- `sync_ai_acceptance.mjs`
  - EN: sync script (`once` or daemon polling).
  - 中文：同步脚本（单次或常驻轮询）。
- `run_acceptance_once.bat`
  - EN: run one sync round.
  - 中文：执行一次同步。
- `run_acceptance_sync.bat`
  - EN: start daemon sync in new terminal.
  - 中文：新终端启动常驻同步。
- `stop_acceptance_sync.bat`
  - EN: stop daemon sync process.
  - 中文：停止常驻同步进程。

## Quick Start / 快速使用

- EN:
  - Double click `run_acceptance_once.bat` for one-time sync.
  - Double click `run_acceptance_sync.bat` to start daemon sync.
  - Double click `stop_acceptance_sync.bat` to stop daemon.
- 中文：
  - 双击 `run_acceptance_once.bat` 执行一次同步。
  - 双击 `run_acceptance_sync.bat` 启动常驻同步。
  - 双击 `stop_acceptance_sync.bat` 停止常驻同步。

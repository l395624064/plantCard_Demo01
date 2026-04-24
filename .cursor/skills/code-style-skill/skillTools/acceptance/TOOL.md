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
- `requirements_input.json`
  - EN: demand-stage requirement input (single source of truth).
  - 中文：需求阶段确认后的清单输入（唯一来源）。
- `gameview_acceptance_state.json`
  - EN: state source for GameView acceptance board.
  - 中文：GameView 验收看板状态源。
- `sync_gameview_acceptance.mjs`
  - EN: sync GameView AI acceptance from bridge logs.
  - 中文：基于 bridge 日志同步 GameView AI 验收结果。
- `run_gameview_acceptance_once.bat`
  - EN: one-time sync and auto-open board file.
  - 中文：执行一次同步并自动打开看板文件。
- `run_gameview_acceptance_sync.bat`
  - EN: start GameView acceptance daemon sync.
  - 中文：启动 GameView 验收常驻同步。
- `stop_gameview_acceptance_sync.bat`
  - EN: stop GameView acceptance daemon process.
  - 中文：停止 GameView 验收常驻进程。
- `analyze_gameview_acceptance_report.mjs`
  - EN: generate mismatch report with trace-point locate hints.
  - 中文：生成冲突报告并给出埋点定位提示。

## Quick Start / 快速使用

- EN:
  - Double click `run_acceptance_once.bat` for one-time sync.
  - Double click `run_acceptance_sync.bat` to start daemon sync.
  - Double click `stop_acceptance_sync.bat` to stop daemon.
- 中文：
  - 双击 `run_acceptance_once.bat` 执行一次同步。
  - 双击 `run_acceptance_sync.bat` 启动常驻同步。
  - 双击 `stop_acceptance_sync.bat` 停止常驻同步。

## GameView Flow Simulation / GameView 流程模拟

- EN:
  - Maintain `requirements_input.json` from demand stage first.
  - Run `run_gameview_acceptance_once.bat` to sync and open board.
  - Start web chain: `skillTools\web\run_web3_bridge.bat` and `skillTools\web\run_web4_poll.bat`.
  - Start AI sync: `run_gameview_acceptance_sync.bat`.
  - Stop polling: `skillTools\web\stop_web4_poll.bat`.
  - Generate report: `node skillTools/acceptance/analyze_gameview_acceptance_report.mjs`.
- 中文：
  - 先维护需求阶段清单：`requirements_input.json`。
  - 运行 `run_gameview_acceptance_once.bat` 同步并自动打开看板。
  - 启动 web 工具链：`skillTools\web\run_web3_bridge.bat` 与 `skillTools\web\run_web4_poll.bat`。
  - 启动 AI 同步：`run_gameview_acceptance_sync.bat`。
  - 停止轮询：`skillTools\web\stop_web4_poll.bat`。
  - 生成报告：`node skillTools/acceptance/analyze_gameview_acceptance_report.mjs`。

# Web Toolchain Tools / Web 工具链工具说明

## Purpose / 作用

- EN: Provide isolated implementations for `WEB-3` (browser log persistence bridge) and `WEB-4` (IDE terminal auto polling) under project-level `skillTools/*`.
- 中文：在项目级 `skillTools/*` 下提供 `WEB-3`（浏览器日志落盘桥接）与 `WEB-4`（IDE 终端自动轮询）隔离实现。

## Files / 文件

- `web3_browser_log_bridge.mjs`
  - EN: Convert browser console payload input into structured `jsonl` records.
  - 中文：将浏览器控制台日志输入转换为结构化 `jsonl` 记录。
  - EN: default `dedupe=false`, so each run appends new bridge records.
  - 中文：默认 `dedupe=false`，每次执行都会追加新的桥接记录。
- `web4_terminal_auto_poll.mjs`
  - EN: Poll bridge output file and print incremental records in terminal.
  - 中文：轮询桥接输出文件，并在终端增量打印新增记录。
- `run_web3_bridge.bat`
  - EN: Windows launcher for `WEB-3`.
  - 中文：`WEB-3` 的 Windows 启动脚本。
- `run_web4_poll.bat`
  - EN: Windows launcher for `WEB-4`.
  - 中文：`WEB-4` 的 Windows 启动脚本。
  - EN: starts a new terminal window and keeps polling.
  - 中文：会开启新终端窗口并持续轮询。
- `stop_web4_poll.bat`
  - EN: Windows stop script for `WEB-4` polling process.
  - 中文：`WEB-4` 轮询进程的 Windows 停止脚本。

## Default I/O / 默认输入输出

- Input / 输入: `skillTools/web/runtime/browser_console_logs.json`
- Output / 输出: `skillTools/web/runtime/browser_console_bridge.jsonl`

## Quick Start / 快速使用

- EN:
  - Double click `run_web3_bridge.bat`
  - Double click `run_web4_poll.bat`
  - Double click `stop_web4_poll.bat` to stop polling
- 中文：
  - 双击 `run_web3_bridge.bat`
  - 双击 `run_web4_poll.bat`
  - 结束轮询时双击 `stop_web4_poll.bat`

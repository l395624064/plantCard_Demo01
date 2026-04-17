# code-style-skill Pending Plan Items

> This file stores pending items only, to avoid polluting `SKILL.md` / `SKILL.zh-CN.md` core rules.
> 本文件仅用于维护待定计划项，避免污染 `SKILL.md` / `SKILL.zh-CN.md` 的正式规则正文。

## Status

- Last synchronized: `20260417-115051`
- Source skill: `code-style-skill`

## Pending Items

- Regression checklist template library (discussion pending).
- Rule conflict priority matrix (discussion pending).
- Interactive acceptance checklist board (spreadsheet-like, discussion pending):
  - each item includes both "user accepted" and "AI accepted" status columns,
  - AI can observe user check actions,
  - AI can align checklist status via `{{browser_mcp_server}}` (browser runtime) or `tmp/*` trace files (non-browser runtime).

## 待定计划项

- 回归清单模板库（待讨论）。
- 规则冲突优先级矩阵（待讨论）。
- 交互式验收清单面板（类网页 Excel，待讨论）：
  - 每个清单项包含“用户验收完成”与“AI验收完成”状态列；
  - 用户勾选行为可被 AI 感知；
  - AI 可通过 `{{browser_mcp_server}}`（浏览器环境）或 `tmp/*` 日志文件（非浏览器环境）自动对齐清单状态。
